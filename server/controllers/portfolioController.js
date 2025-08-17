//portfolioController.js
const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");
const User = require("../models/User");

// Helper: decrypt keys if encrypted
const decryptApiKey = (key) => key;

exports.getBinanceBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const binanceKey = Array.isArray(user.apiKeys)
      ? user.apiKeys.find((k) => k.exchange === "binance")
      : undefined;

    if (!binanceKey) return res.status(404).json({ message: "Binance API key not found" });

    const apiKey = decryptApiKey(binanceKey.apiKey);
    const apiSecret = decryptApiKey(binanceKey.apiSecret);

    const data = await binanceService.getAccountInfo(apiKey, apiSecret);
    res.json({ balances: data.balances });
  } catch (err) {
    console.error("Binance error:", err.message);
    res.status(500).json({ message: "Failed to fetch Binance balances" });
  }
};


exports.getCoinDCXBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const coindcxKey = user.apiKeys.find((k) => k.exchange === "coindcx");
    if (!coindcxKey) return res.status(404).json({ message: "CoinDCX API key not found" });

    const apiKey = decryptApiKey(coindcxKey.apiKey);
    const apiSecret = decryptApiKey(coindcxKey.apiSecret);

    const data = await coindcxService.getAccountInfo(apiKey, apiSecret);
    res.json({ balances: data });
  } catch (err) {
    console.error("CoinDCX error:", err.message);
    res.status(500).json({ message: "Failed to fetch CoinDCX balances" });
  }
};

exports.getAllBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let allBalances = [];

    // Loop through all API keys the user has
    for (const key of user.apiKeys) {
      const apiKey = decryptApiKey(key.apiKey);
      const apiSecret = decryptApiKey(key.apiSecret);
      let data;

      switch (key.exchange) {
        case "binance":
          data = await binanceService.getAccountInfo(apiKey, apiSecret);
          allBalances = allBalances.concat(data.balances || []);
          break;
        case "coindcx":
          data = await coindcxService.getAccountInfo(apiKey, apiSecret);
          allBalances = allBalances.concat(data || []);
          break;
        // Add other exchanges as you integrate them similarly
        default:
          break;
      }
    }

    res.json({ balances: allBalances });
  } catch (err) {
    console.error("Error fetching all balances:", err.message);
    res.status(500).json({ message: "Failed to fetch all balances" });
  }
};

