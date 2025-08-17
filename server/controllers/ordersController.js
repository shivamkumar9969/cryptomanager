const User = require("../models/User");
const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");

const decryptApiKey = (key) => key; // Replace with real decryption if implemented

exports.placeOrder = async (req, res) => {
  const { exchange, symbol, side, type, price, quantity, orderId, market } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const keyData = user.apiKeys.find((k) => k.exchange === exchange);
    if (!keyData) return res.status(400).json({ message: `${exchange} API key not found` });

    const apiKey = decryptApiKey(keyData.apiKey);
    const apiSecret = decryptApiKey(keyData.apiSecret);

    let result;
    if (exchange === "binance") {
      result = await binanceService.placeOrder(apiKey, apiSecret, {
        symbol,
        side,
        type,
        quantity,
        ...(type === "LIMIT" && { price, timeInForce: "GTC" }),
      });
    } else if (exchange === "coindcx") {
      // For CoinDCX, symbol param is called market, side values are lowercase 'buy'/'sell'
      result = await coindcxService.placeOrder(apiKey, apiSecret, {
        market: symbol.toLowerCase(),
        side: side.toLowerCase(),
        type: type.toLowerCase(),
        price,
        quantity,
      });
    } else {
      return res.status(400).json({ message: "Unsupported exchange" });
    }

    res.json(result);
  } catch (err) {
    console.error("Place order error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const { exchange, symbol, market } = req.query;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const keyData = user.apiKeys.find((k) => k.exchange === exchange);
    if (!keyData) return res.status(400).json({ message: `${exchange} API key not found` });

    const apiKey = decryptApiKey(keyData.apiKey);
    const apiSecret = decryptApiKey(keyData.apiSecret);

    let result;
    if (exchange === "binance") {
      if (!symbol) return res.status(400).json({ message: "Symbol is required" });
      result = await binanceService.getAllOrders(apiKey, apiSecret, symbol);
    } else if (exchange === "coindcx") {
      if (!market) return res.status(400).json({ message: "Market is required" });
      result = await coindcxService.getAllOrders(apiKey, apiSecret, market);
    } else {
      return res.status(400).json({ message: "Unsupported exchange" });
    }

    res.json(result);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  const { exchange, symbol, orderId, market } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const keyData = user.apiKeys.find((k) => k.exchange === exchange);
    if (!keyData) return res.status(400).json({ message: `${exchange} API key not found` });

    const apiKey = decryptApiKey(keyData.apiKey);
    const apiSecret = decryptApiKey(keyData.apiSecret);

    let result;
    if (exchange === "binance") {
      if (!symbol || !orderId) return res.status(400).json({ message: "Symbol and orderId are required" });
      result = await binanceService.cancelOrder(apiKey, apiSecret, symbol, orderId);
    } else if (exchange === "coindcx") {
      if (!orderId) return res.status(400).json({ message: "OrderId is required" });
      result = await coindcxService.cancelOrder(apiKey, apiSecret, orderId);
    } else {
      return res.status(400).json({ message: "Unsupported exchange" });
    }

    res.json(result);
  } catch (err) {
    console.error("Cancel order error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
