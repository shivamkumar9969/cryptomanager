// server/controllers/exchangeController.js
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encrypt');
const binanceService = require('../services/binanceService');
const coindcxService = require('../services/coindcxService');

/**
 * Save API keys after validating them by calling the exchange.
 * Body may contain binanceApiKey/binanceApiSecret and/or coindcxApiKey/coindcxApiSecret
 */
exports.saveExchangeKeys = async (req, res) => {
  try {
    const { binanceApiKey, binanceApiSecret, coindcxApiKey, coindcxApiSecret } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate Binance keys if provided
    if (binanceApiKey && binanceApiSecret) {
      try {
        await binanceService.getAccountInfo(binanceApiKey, binanceApiSecret);
      } catch (err) {
        return res.status(400).json({ message: 'Binance keys invalid: ' + err.message });
      }
      user.binanceApiKey = encrypt(binanceApiKey);
      user.binanceApiSecret = encrypt(binanceApiSecret);
    }

    // Validate CoinDCX keys if provided
    if (coindcxApiKey && coindcxApiSecret) {
      try {
        await coindcxService.getAccountInfo(coindcxApiKey, coindcxApiSecret);
      } catch (err) {
        return res.status(400).json({ message: 'CoinDCX keys invalid: ' + err.message });
      }
      user.coindcxApiKey = encrypt(coindcxApiKey);
      user.coindcxApiSecret = encrypt(coindcxApiSecret);
    }

    await user.save();
    return res.json({ message: 'Keys saved and validated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Fetch balances from exchanges using the stored (decrypted) credentials.
 * Query params: ?exchange=binance|coindcx or omit to fetch both
 */
exports.getBalances = async (req, res) => {
  try {
    const exchange = req.query.exchange; // optional
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = {};

    // Binance
    if (!exchange || exchange === 'binance') {
      if (user.binanceApiKey && user.binanceApiSecret) {
        try {
          const apiKey = decrypt(user.binanceApiKey);
          const apiSecret = decrypt(user.binanceApiSecret);
          const data = await binanceService.getAccountInfo(apiKey, apiSecret);
          result.binance = data;
        } catch (err) {
          result.binance = { error: 'Failed to fetch Binance: ' + err.message };
        }
      } else {
        result.binance = { error: 'No Binance keys saved' };
      }
    }

    // CoinDCX
    if (!exchange || exchange === 'coindcx') {
      if (user.coindcxApiKey && user.coindcxApiSecret) {
        try {
          const apiKey = decrypt(user.coindcxApiKey);
          const apiSecret = decrypt(user.coindcxApiSecret);
          const data = await coindcxService.getAccountInfo(apiKey, apiSecret);
          result.coindcx = data;
        } catch (err) {
          result.coindcx = { error: 'Failed to fetch CoinDCX: ' + err.message };
        }
      } else {
        result.coindcx = { error: 'No CoinDCX keys saved' };
      }
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
