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

async function getPortfolioValueForUser(userId, getUserApiKeys) {
  try {
    const keys = await getUserApiKeys(userId, "coindcx");
    if (!keys) return null;

    const timestamp = Math.floor(Date.now());
    const body = { timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac("sha256", keys.apiSecret)
      .update(payload)
      .digest("hex");

    const res = await axios.post(
      `${COINDCX_BASE_URL}/exchange/v1/users/balances`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-AUTH-APIKEY": keys.apiKey,
          "X-AUTH-SIGNATURE": signature,
        },
        timeout: 10000,
        httpsAgent: agent,
      }
    );

    const balances = res.data;
    console.log('coindcx blance:',balances);
    if (!balances || !Array.isArray(balances)) return null;

    const { getPriceUSD } = require("./priceService");

    let totalValue = 0;
    const assets = [];

    // Use correct CoinDCX fields: 'balance' (free), 'locked_balance'
    for (const asset of balances) {
      // asset.currency = symbol
      const freeAmount = parseFloat(asset.balance ?? "0");
      const lockedAmount = parseFloat(asset.locked_balance ?? "0");
      const totalAmount = freeAmount + lockedAmount;

      if (totalAmount > 0) {
        const price = await getPriceUSD(asset.currency);
        const value = totalAmount * price;
        totalValue += value;
        assets.push({
          asset: asset.currency,
          quantity: totalAmount,
          value,
        });
      }
    }

    return { totalValue, assets };
  } catch (err) {
    console.error("CoinDCX portfolio value error:", err.message || err);
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
