require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

// ===== Binance Test =====
async function testBinance() {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha256", process.env.BINANCE_API_SECRET)
      .update(queryString)
      .digest("hex");

    const res = await axios.get(
      `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
      {
        headers: { "X-MBX-APIKEY": process.env.BINANCE_API_KEY },
      }
    );

    console.log("✅ Binance Account Balances:", res.data.balances);
  } catch (err) {
    console.error("❌ Binance API Error:", err.response?.data || err.message);
  }
}

// ===== CoinDCX Test =====
async function testCoinDCX() {
  try {
    const timestamp = Math.floor(Date.now());
    const body = { timestamp };
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto
      .createHmac("sha256", process.env.COINDCX_API_SECRET)
      .update(payload)
      .digest("hex");

    const res = await axios.post(
      "https://api.coindcx.com/exchange/v1/users/balances",
      body,
      {
        headers: {
          "X-AUTH-APIKEY": process.env.COINDCX_API_KEY,
          "X-AUTH-SIGNATURE": signature,
        },
      }
    );

    console.log("✅ CoinDCX Account Balances:", res.data);
  } catch (err) {
    console.error("❌ CoinDCX API Error:", err.response?.data || err.message);
  }
}

// Run both tests
(async () => {
  await testBinance();
  await testCoinDCX();
})();
