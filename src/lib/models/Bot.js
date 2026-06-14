const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [String],
  exchangeName: { type: String, required: true },
  symbol: { type: String, required: true },
  strategy: {
    type: String,
    enum: ['dca', 'grid', 'rsi', 'macd', 'trailing_stop', 'webhook'],
    required: true,
  },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['active', 'paused', 'stopped'],
    default: 'stopped',
  },
  isPaperTrade: { type: Boolean, default: false },
  isBacktest: { type: Boolean, default: false },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  totalPnl: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  tradeCount: { type: Number, default: 0 },
  startedAt: Date,
  stoppedAt: Date,
  lastRunAt: Date,
  nextRunAt: Date,
}, { timestamps: true });

module.exports = mongoose.models.Bot || mongoose.model('Bot', botSchema);
