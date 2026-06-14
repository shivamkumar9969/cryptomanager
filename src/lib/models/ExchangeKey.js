// models/ExchangeKey.js
// Stores encrypted API keys for each connected exchange account

const mongoose = require('mongoose');

const ExchangeKeySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exchangeName: { type: String, required: true, lowercase: true },
  // e.g. "binance", "coindcx", "wazirx", "kraken", "coinbase", "bybit", "kucoin"

  label:        { type: String, default: '' }, // user-facing name e.g. "My Main Binance"

  // Keys stored AES-256-GCM encrypted — NEVER stored plaintext
  apiKey:       { type: String, required: true },    // encrypted
  apiSecret:    { type: String, required: true },    // encrypted
  passphrase:   { type: String, default: null },     // encrypted — used by KuCoin, OKX

  // Permissions detected on last test
  permissions:  { type: [String], default: [] }, // ['read', 'trade', 'withdraw']

  // Status
  isActive:     { type: Boolean, default: true },
  isValid:      { type: Boolean, default: null }, // null = not tested yet

  // Test results
  lastTestedAt: { type: Date, default: null },
  lastTestError:{ type: String, default: null },
  lastUsedAt:   { type: Date, default: null },

  // IP whitelist hint (for user reference)
  ipWhitelist:  { type: [String], default: [] },

}, { timestamps: true });

// Compound index: one entry per exchange per user (multiple allowed via label)
ExchangeKeySchema.index({ userId: 1, exchangeName: 1 });

module.exports = mongoose.models.ExchangeKey || mongoose.models.ExchangeKey || mongoose.model('ExchangeKey', ExchangeKeySchema);
