// portfolioController.js
const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");
const User = require("../models/User");

// Helper: decrypt keys if encrypted
const decryptApiKey = (key) => key;

exports.getBinanceBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedCurrency = req.query.currency || "USDT";
    const user = await User.findById(userId);
    let binancePortfolio = null;
    const binanceKey = user.apiKeys.find((k) => k.exchange.toLowerCase() === "binance");
    if (binanceKey) {
      const apiKey = binanceKey.apiKey;
      const apiSecret = binanceKey.apiSecret;
      binancePortfolio = await binanceService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }
    res.json({ binance: binancePortfolio });
  } catch (err) {
    console.error("Binance error:", err.message);
    res.status(500).json({ message: "Failed to fetch Binance balances" });
  }
};

exports.getCoinDCXBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedCurrency = req.query.currency || "USDT";
    const user = await User.findById(userId);
    let coindcxPortfolio = null;
    const coindcxKey = user.apiKeys.find((k) => k.exchange.toLowerCase() === "coindcx");
    if (coindcxKey) {
      const apiKey = coindcxKey.apiKey;
      const apiSecret = coindcxKey.apiSecret;
      coindcxPortfolio = await coindcxService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }    
    res.json({ coindcx: coindcxPortfolio });
  } catch (err) {
    console.error("CoinDCX error:", err.message);
    res.status(500).json({ message: "Failed to fetch CoinDCX balances" });
  }
};

exports.getAllBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedCurrency = req.query.currency || "USDT";
    const user = await User.findById(userId);
    let binancePortfolio = null;
    let coindcxPortfolio = null;
    const binanceKey = user.apiKeys.find(
      (k) => k.exchange.toLowerCase() === "binance"
    );
    const coindcxKey = user.apiKeys.find(
      (k) => k.exchange.toLowerCase() === "coindcx"
    );
    if (coindcxKey) {
      const apiKey = coindcxKey.apiKey;
      const apiSecret = coindcxKey.apiSecret;
      coindcxPortfolio = await coindcxService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }
    if (binanceKey) {
      const apiKey = binanceKey.apiKey;
      const apiSecret = binanceKey.apiSecret;
      binancePortfolio = await binanceService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }
    res.json({
      binance: binancePortfolio,
      coindcx: coindcxPortfolio,
    });
  } catch (err) {
    console.error("Error in getAllBalances:", err.message);
    res.status(500).json({ message: "Unexpected server error" });
  }
};
