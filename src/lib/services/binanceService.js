// services/binanceService.js

const axios = require('axios');
const crypto = require('crypto');
const BINANCE_BASE_URL = 'https://api.binance.com';

// Maps crypto symbols to CoinGecko IDs for price fetch
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

// Returns just the filtered 'balances' array directly
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

    // Return only balances array
    return res.data.balances.filter(
      (b) => parseFloat(b.free) + parseFloat(b.locked) > 0
    );
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

// Unified format, supports cross-currency valuation just like CoinDCX
async function getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency = "USDT") {
  try {
    const balances = await getAccountInfo(apiKey, apiSecret);

    // Create symbol pairs asset+selectedCurrency for Binance ticker query
    const symbolSet = new Set(
      balances
        .filter(b => b.asset !== selectedCurrency)
        .map(b => `${b.asset}${selectedCurrency}`)
    );

    let prices = {};
    if (symbolSet.size > 0 && ["USDT", "BTC", "ETH", "BNB"].includes(selectedCurrency.toUpperCase())) {
      try {
        const priceRes = await axios.get(`${BINANCE_BASE_URL}/api/v3/ticker/price`, {
          params: { symbols: JSON.stringify(Array.from(symbolSet)) },
        });
        (priceRes.data || []).forEach((p) => {
          prices[p.symbol] = parseFloat(p.price);
        });
      } catch {
        // fallback silent
      }
    }

    // CoinGecko fiat conversion for fallback or non-Binance currencies like INR
    let usdtToTarget = 1;
    if (selectedCurrency !== "USDT") {
      const conversionRates = {
        'inr': 'inr',
        'usd': 'usd',
        'eur': 'eur',
      };
      const fiatKey = selectedCurrency.toLowerCase();
      if (conversionRates[fiatKey]) {
        try {
          const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${fiatKey}`);
          usdtToTarget = res.data?.tether?.[fiatKey] || 1;
        } catch {
          usdtToTarget = 1;
        }
      }
    }

    async function getPriceInSelectedCurrency(asset) {
      if (asset === selectedCurrency) return 1;

      const directSymbol = `${asset}${selectedCurrency}`;
      if (prices[directSymbol]) return prices[directSymbol];

      const usdtSymbol = `${asset}USDT`;
      if (prices[usdtSymbol]) {
        return prices[usdtSymbol] * usdtToTarget;
      }

      const priceInUSDT = await getPriceUSD(asset);
      return priceInUSDT * usdtToTarget;
    }

    const portfolio = [];
    for (const b of balances) {
      const freeQty = parseFloat(b.free);
      const lockedQty = parseFloat(b.locked);
      const totalQty = freeQty + lockedQty;
      if (totalQty <= 0) continue;
      const price = await getPriceInSelectedCurrency(b.asset);
      portfolio.push({
        asset: b.asset,
        free_quantity: freeQty,
        locked_quantity: lockedQty,
        quantity: totalQty,
        price,
        value: totalQty * price,
      });
    }

    return portfolio;
  } catch (err) {
    console.error("Binance portfolio error:", err.message);
    return [];
  }
}


module.exports = {
  getAccountInfo,
  placeOrder,
  getAllOrders,
  cancelOrder,
  getPortfolioValueForUser,
};
