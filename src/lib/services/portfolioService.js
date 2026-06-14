// lib/services/portfolioService.js
// Aggregates portfolio data across all connected exchanges

const ExchangeKey = require('../models/ExchangeKey');
const { decrypt } = require('./encryptionService');
const BinanceAdapter = require('./exchanges/binanceService');
const CoindcxAdapter = require('./exchanges/coindcxService');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');
const dbConnect = require('../dbConnect');

/**
 * Instantiate the correct exchange adapter based on exchangeName
 */
function getAdapter(exchangeName, apiKey, apiSecret, passphrase) {
  switch (exchangeName.toLowerCase()) {
    case 'binance':
      return new BinanceAdapter(apiKey, apiSecret);
    case 'coindcx':
      return new CoindcxAdapter(apiKey, apiSecret);
    // Add WazirX, Kraken, etc. here in Phase 2
    default:
      throw new Error(`Unsupported exchange: ${exchangeName}`);
  }
}

/**
 * Fetch unified portfolio across all user's connected exchanges
 * @param {string} userId 
 * @param {string} currency - Display currency (USDT, INR, etc)
 */
async function getUnifiedPortfolio(userId, currency = 'USDT') {
  await dbConnect();
  
  // 1. Get all active API keys for the user
  const keys = await ExchangeKey.find({ userId, isActive: true });
  
  const results = {
    totalValue: 0,
    exchanges: {},
    assets: {}, // Consolidated by asset: { 'BTC': { quantity, value, allocationPct } }
    errors: []
  };

  if (keys.length === 0) return results;

  // 2. Fetch portfolio from each exchange in parallel
  const fetchPromises = keys.map(async (keyObj) => {
    try {
      const apiKey = decrypt(keyObj.apiKey);
      const apiSecret = decrypt(keyObj.apiSecret);
      const passphrase = keyObj.passphrase ? decrypt(keyObj.passphrase) : null;

      const adapter = getAdapter(keyObj.exchangeName, apiKey, apiSecret, passphrase);
      
      const portfolio = await adapter.getPortfolio(currency);
      
      let exchangeTotal = 0;
      
      // Merge into unified view
      portfolio.forEach(asset => {
        exchangeTotal += asset.value;
        
        // Add to consolidated assets map
        if (!results.assets[asset.asset]) {
          results.assets[asset.asset] = {
            asset: asset.asset,
            quantity: 0,
            value: 0,
            price: asset.price, // Will just take the last seen price across exchanges for display
            exchanges: []
          };
        }
        
        results.assets[asset.asset].quantity += asset.quantity;
        results.assets[asset.asset].value += asset.value;
        results.assets[asset.asset].exchanges.push({
          name: keyObj.exchangeName,
          quantity: asset.quantity,
          value: asset.value
        });
      });

      results.exchanges[keyObj.exchangeName] = {
        totalValue: exchangeTotal,
        assets: portfolio
      };

      results.totalValue += exchangeTotal;
      
      // Update key status to valid if it succeeded
      if (!keyObj.isValid) {
        keyObj.isValid = true;
        keyObj.lastTestedAt = new Date();
        await keyObj.save();
      }

    } catch (err) {
      console.error(`Failed to fetch portfolio for ${keyObj.exchangeName}:`, err.message);
      results.errors.push({ exchange: keyObj.exchangeName, error: err.message });
      
      // Mark key as invalid if auth failed
      if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('signature') || err.message.toLowerCase().includes('key')) {
        keyObj.isValid = false;
        keyObj.lastTestError = err.message;
        keyObj.lastTestedAt = new Date();
        await keyObj.save();
      }
    }
  });

  await Promise.all(fetchPromises);

  // 3. Calculate allocation percentages
  if (results.totalValue > 0) {
    Object.values(results.assets).forEach(asset => {
      asset.allocationPct = (asset.value / results.totalValue) * 100;
    });
  }

  // Convert assets map to sorted array
  results.assets = Object.values(results.assets).sort((a, b) => b.value - a.value);

  return results;
}

/**
 * Takes a daily snapshot of the portfolio and saves it to the database.
 * Designed to be run by a daily cron job.
 */
async function takeDailySnapshot(userId) {
  try {
    const portfolio = await getUnifiedPortfolio(userId, 'USDT');
    if (portfolio.totalValue === 0 && portfolio.assets.length === 0) return null;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Map consolidated assets for the DB schema
    const snapshotAssets = [];
    portfolio.assets.forEach(aggAsset => {
      aggAsset.exchanges.forEach(ex => {
        snapshotAssets.push({
          exchangeName: ex.name,
          asset: aggAsset.asset,
          quantity: ex.quantity,
          priceUSDT: aggAsset.price,
          valueUSDT: ex.value,
          // If we had INR values we'd set them here
        });
      });
    });

    // Calculate change by looking at yesterday's snapshot
    let changeUSDT = 0;
    let changePctUSDT = 0;
    
    const previousSnapshot = await PortfolioSnapshot.findOne({ userId })
      .sort({ snapshotDate: -1 })
      .limit(1);

    if (previousSnapshot && previousSnapshot.totalValueUSDT > 0) {
      changeUSDT = portfolio.totalValue - previousSnapshot.totalValueUSDT;
      changePctUSDT = (changeUSDT / previousSnapshot.totalValueUSDT) * 100;
    }

    // Upsert snapshot for today
    const snapshot = await PortfolioSnapshot.findOneAndUpdate(
      { userId, snapshotDate: today },
      {
        totalValueUSDT: portfolio.totalValue,
        changeUSDT,
        changePctUSDT,
        assets: snapshotAssets,
        exchangeCount: Object.keys(portfolio.exchanges).length
      },
      { new: true, upsert: true }
    );

    return snapshot;
  } catch (error) {
    console.error(`Failed to take snapshot for user ${userId}:`, error);
    return null;
  }
}

module.exports = {
  getUnifiedPortfolio,
  takeDailySnapshot,
  getAdapter
};
