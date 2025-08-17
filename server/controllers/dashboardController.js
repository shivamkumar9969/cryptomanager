const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");
const User = require("../models/User");

// Helper: fetch API keys from DB
async function getUserApiKeys(userId, exchange) {
  const user = await User.findById(userId).select("apiKeys").lean();
  if (!user || !user.apiKeys) return null;
  const key = user.apiKeys.find(
    (k) => k.exchange.toLowerCase() === exchange.toLowerCase()
  );
  if (!key) return null;
  return { apiKey: key.apiKey, apiSecret: key.apiSecret };
}

// Helper to merge balances into topAssets (group by asset)
function mergeBalances(balancesFromExchanges) {
  const assetMap = {};

  balancesFromExchanges.forEach(({ exchange, balances }) => {
    balances.forEach((b) => {
      if (!assetMap[b.asset]) {
        assetMap[b.asset] = {
          asset: b.asset,
          quantity: 0,
          value: 0,
          platforms: [],
        };
      }
      assetMap[b.asset].quantity += b.quantity || 0;
      assetMap[b.asset].value += b.value || 0;
      if (!assetMap[b.asset].platforms.includes(exchange)) {
        assetMap[b.asset].platforms.push(exchange);
      }
    });
  });

  return Object.values(assetMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

exports.dashboardSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get portfolio from Binance
    const binancePortfolio = await binanceService.getPortfolioValueForUser(userId);

    // Get portfolio from CoinDCX
    const coindcxPortfolio = await coindcxService.getPortfolioValueForUser(
      userId,
      getUserApiKeys
    );

    // Merge top assets from both
    const topAssets = mergeBalances([
      {
        exchange: "Binance",
        balances: binancePortfolio?.assets || [],
      },
      {
        exchange: "CoinDCX",
        balances: coindcxPortfolio?.assets || [],
      },
    ]);

    // Mock recent activity, replace with real data if available
    const recentActivity = [
      {
        exchange: "Binance",
        type: "Buy",
        asset: "BTC",
        amount: 0.01,
        date: new Date().toISOString(),
      },
      {
        exchange: "CoinDCX",
        type: "Sell",
        asset: "ETH",
        amount: 0.5,
        date: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const result = {
      exchanges: [
        {
          name: "Binance",
          connected: !!binancePortfolio,
          balancesValue: binancePortfolio?.totalValue || 0,
          lastSync: new Date().toISOString(),
        },
        {
          name: "CoinDCX",
          connected: !!coindcxPortfolio,
          balancesValue: coindcxPortfolio?.totalValue || 0,
          lastSync: new Date().toISOString(),
        },
      ],
      topAssets,
      recentActivity,
    };

    res.json(result);
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Could not get dashboard summary." });
  }
};
