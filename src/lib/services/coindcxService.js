// coindcxService.js

const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const COINDCX_BASE_URL = 'https://api.coindcx.com';

const agent = new https.Agent({ family: 4 }); // Force IPv4

async function getAccountInfo(apiKey, apiSecret) {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

    const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/users/balances`, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-APIKEY': apiKey,
        'X-AUTH-SIGNATURE': signature
      },
      timeout: 500000,
      httpsAgent: agent
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data || err.message;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

async function getUserInfo(apiKey, apiSecret) {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

    const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/users/info`, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-APIKEY': apiKey,
        'X-AUTH-SIGNATURE': signature
      },
      timeout: 500000,
      httpsAgent: agent
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data || err.message;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

// Place order on CoinDCX
async function placeOrder(apiKey, apiSecret, params) {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { ...params, timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

    const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/orders/create`, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-APIKEY': apiKey,
        'X-AUTH-SIGNATURE': signature,
      },
      httpsAgent: agent,
    });

    return res.data;
  } catch (err) {
    const message = err.response?.data || err.message;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

// Get all orders
async function getAllOrders(apiKey, apiSecret, market) {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { market, timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

    const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/orders`, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-APIKEY': apiKey,
        'X-AUTH-SIGNATURE': signature,
      },
      httpsAgent: agent,
    });

    return res.data;
  } catch (err) {
    const message = err.response?.data || err.message;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

// Cancel order
async function cancelOrder(apiKey, apiSecret, orderId) {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { order_id: orderId, timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

    const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/orders/cancel`, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-APIKEY': apiKey,
        'X-AUTH-SIGNATURE': signature,
      },
      httpsAgent: agent,
    });

    return res.data;
  } catch (err) {
    const message = err.response?.data || err.message;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}



async function getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency = "USDT", agent = null) {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac("sha256", apiSecret).update(payload).digest("hex");

    // Fetch balances
    const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/users/balances`, body, {
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-APIKEY": apiKey,
        "X-AUTH-SIGNATURE": signature,
      },
      timeout: 10000,
      httpsAgent: agent,
    });
    const balances = res.data || [];
    const tickersRes = await axios.get(`${COINDCX_BASE_URL}/exchange/ticker`);
    const priceMap = {};
    for (const t of tickersRes.data) {
      priceMap[t.market.toUpperCase()] = parseFloat(t.last_price);
    }
    const getPriceInSelectedCurrency = (asset) => {
      const symbol = asset.toUpperCase();
      let key = `${symbol}${selectedCurrency}`;
      if (priceMap[key]) return priceMap[key];
      if (selectedCurrency !== "USDT" && priceMap[`${symbol}USDT`] && priceMap[`USDT${selectedCurrency}`]) {
        return priceMap[`${symbol}USDT`] * priceMap[`USDT${selectedCurrency}`];
      }
      if (priceMap[`${symbol}BTC`]) {
        const btcToSelected = selectedCurrency === "BTC" ? 1 : priceMap[`BTC${selectedCurrency}`];
        if (btcToSelected) return priceMap[`${symbol}BTC`] * btcToSelected;
      }
      return 0;
    };
    const portfolio = [];
    for (const asset of balances) {
      const freeQty = parseFloat(asset.balance ?? 0);
      const lockedQty = parseFloat(asset.locked_balance ?? 0);
      const totalQty = freeQty + lockedQty;
      if (totalQty <= 0) continue;
      const price = getPriceInSelectedCurrency(asset.currency);
      portfolio.push({
        asset: asset.currency,
        free_quantity: freeQty,
        locked_quantity: lockedQty,
        quantity: totalQty,
        price,
        value: totalQty * price,
      });
    }
    return portfolio;
  } catch (err) {
    console.error("CoinDCX portfolio error:", err.message || err);
    return [];
  }
}


module.exports = {
  getAccountInfo,
  placeOrder,
  getAllOrders,
  cancelOrder,
  getPortfolioValueForUser,
  getUserInfo,
};
