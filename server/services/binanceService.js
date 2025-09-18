// services/binanceService.js

const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const BINANCE_BASE_URL = 'https://api.binance.com';


async function getPriceUSD(symbol) {
  try {
    const idMap = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      DOGE: "dogecoin",
      LUNA: "terra-luna",
      YFI: "yearn-finance",
    };
    const coinId = idMap[symbol.toUpperCase()] || symbol.toLowerCase();
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    return res.data[coinId]?.usd || 0;
  } catch {
    return 0;
  }
}

function signQuery(queryString, secret) {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}
async function getAccountInfo(apiKey, apiSecret) {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}&omitZeroBalances=true`;
    const signature = signQuery(queryString, apiSecret);
    const res = await axios.get(`${BINANCE_BASE_URL}/api/v3/account`, {
      headers: { "X-MBX-APIKEY": apiKey },
      params: { timestamp, omitZeroBalances: true, signature },
      timeout: 10000,
    });

    const balances = res.data.balances.filter(
      (b) => parseFloat(b.free) + parseFloat(b.locked) > 0
    );
    const symbols = balances
      .map((b) => (b.asset === "USDT" ? null : `${b.asset}USDT`))
      .filter(Boolean);
    let prices = {};
    if (symbols.length > 0) {
      const priceRes = await axios.get(`${BINANCE_BASE_URL}/api/v3/ticker/price`, {
        params: { symbols: JSON.stringify(symbols) }, 
      });
      prices = priceRes.data.reduce((acc, p) => {
        acc[p.symbol.replace("USDT", "")] = parseFloat(p.price);
        return acc;
      }, {});
    }
    const portfolio = balances.map((b) => {
      const quantity = parseFloat(b.free) + parseFloat(b.locked);
      const price = b.asset === "USDT" ? 1 : prices[b.asset] || 0;
      const value = quantity * price;
      return { asset: b.asset, quantity, price, value };
    });    
    return portfolio;
  } catch (err) {
    const message = err.response?.data || err.message;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
}

async function placeOrder(apiKey, apiSecret, params) {
  const timestamp = Date.now();
  const query = new URLSearchParams({ ...params, timestamp }).toString();
  const signature = signQuery(query, apiSecret);
  const res = await axios.post(
    `${BINANCE_BASE_URL}/api/v3/order?${query}&signature=${signature}`,
    {},
    { headers: { 'X-MBX-APIKEY': apiKey } }
  );
  return res.data;
}

async function getAllOrders(apiKey, apiSecret, symbol) {
  const timestamp = Date.now();
  const query = new URLSearchParams({ symbol, timestamp }).toString();
  const signature = signQuery(query, apiSecret);
  const res = await axios.get(
    `${BINANCE_BASE_URL}/api/v3/allOrders?${query}&signature=${signature}`,
    { headers: { 'X-MBX-APIKEY': apiKey } }
  );
  return res.data;
}

async function cancelOrder(apiKey, apiSecret, symbol, orderId) {
  const timestamp = Date.now();
  const query = new URLSearchParams({ symbol, orderId, timestamp }).toString();
  const signature = signQuery(query, apiSecret);
  const res = await axios.delete(
    `${BINANCE_BASE_URL}/api/v3/order?${query}&signature=${signature}`,
    { headers: { 'X-MBX-APIKEY': apiKey } }
  );
  return res.data;
}

async function getPortfolioValueForUser(apiKey,apiSecret,selectedCurrency) {
  try {   
    const accountInfo = await getAccountInfo(apiKey, apiSecret);
    let totalValue = 0;
    const assets = [];
    for (const asset of accountInfo.balances) {
      const freeAmount = parseFloat(asset.free);
      const lockedAmount = parseFloat(asset.locked);
      const totalAmount = freeAmount + lockedAmount;
      if (totalAmount > 0) {
        const price = await getPriceUSD(asset.asset);
        const value = totalAmount * price;
        totalValue += value;
        assets.push({
          asset: asset.asset,
          quantity: totalAmount,
          value,
        });
      }
    }
    return { totalValue, assets };
  } catch (err) {
    console.error("Binance portfolio value error:", err.message);
    return null;
  }
}
module.exports = {
  getAccountInfo,
  placeOrder,
  getAllOrders,
  cancelOrder,
  getPortfolioValueForUser, 
};
