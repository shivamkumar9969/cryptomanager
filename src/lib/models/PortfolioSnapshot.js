// models/PortfolioSnapshot.js
// Daily snapshot of portfolio value — powers portfolio history chart

const mongoose = require('mongoose');

const AssetSnapshotSchema = new mongoose.Schema({
  exchangeName: { type: String, required: true },
  asset:        { type: String, required: true },  // e.g. "BTC"
  quantity:     { type: Number, required: true },
  priceUSDT:    { type: Number, default: 0 },
  valueUSDT:    { type: Number, default: 0 },
  priceINR:     { type: Number, default: 0 },
  valueINR:     { type: Number, default: 0 },
}, { _id: false });

const PortfolioSnapshotSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  snapshotDate: { type: String, required: true }, // "2026-05-23" — YYYY-MM-DD key for dedup

  // Totals
  totalValueUSDT: { type: Number, default: 0 },
  totalValueINR:  { type: Number, default: 0 },
  totalValueBTC:  { type: Number, default: 0 },

  // Change from previous snapshot
  changeUSDT:    { type: Number, default: 0 }, // absolute
  changePctUSDT: { type: Number, default: 0 }, // percentage

  // Per-asset breakdown
  assets: [AssetSnapshotSchema],

  // How many exchanges contributed
  exchangeCount: { type: Number, default: 0 },

}, { timestamps: true });

// One snapshot per user per day
PortfolioSnapshotSchema.index({ userId: 1, snapshotDate: -1 }, { unique: true });

module.exports = mongoose.models.PortfolioSnapshot || mongoose.models.PortfolioSnapshot || mongoose.model('PortfolioSnapshot', PortfolioSnapshotSchema);
