// models/ScheduledOrder.js
// ⭐ Core automation: auto buy/sell at a specific date & time

const mongoose = require('mongoose');

// Execution history embedded per scheduled order
const ExecutionLogSchema = new mongoose.Schema({
  executedAt:   { type: Date, required: true },
  status:       { type: String, enum: ['placed', 'filled', 'failed', 'skipped', 'paper'], required: true },
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  filledPrice:  { type: Number, default: null },
  filledQty:    { type: Number, default: null },
  error:        { type: String, default: null },
}, { _id: false });

const ScheduledOrderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:         { type: String, required: true, trim: true }, // "Weekly BTC DCA"
  description:  { type: String, default: '' },

  // Exchange & coin
  exchangeName: { type: String, required: true, lowercase: true },
  exchangeKeyId:{ type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeKey', required: true },
  symbol:       { type: String, required: true, uppercase: true }, // "BTCUSDT"

  // Order details
  side:       { type: String, enum: ['buy', 'sell'], required: true },
  orderType:  { type: String, enum: ['market', 'limit'], default: 'market' },
  limitPrice: { type: Number, default: null }, // only for limit orders

  // Amount configuration
  amountType: { type: String, enum: ['currency', 'quantity', 'percentage'], required: true },
  // currency  = spend/receive this much in quote currency (e.g. $100 USDT)
  // quantity  = buy/sell exactly this many base coins (e.g. 0.005 BTC)
  // percentage= use X% of available balance
  amount:     { type: Number, required: true },

  // ── Schedule configuration ──
  scheduleType: { type: String, enum: ['once', 'recurring'], required: true },

  // For one-time orders
  executeAt:    { type: Date, default: null },

  // For recurring orders (cron expression)
  // Examples: "0 10 * * 1" = every Monday 10am, "0 9 1 * *" = 1st of every month 9am
  cronExpression: { type: String, default: null },
  timezone:       { type: String, default: 'Asia/Kolkata' },

  // Recurrence limits
  maxExecutions:  { type: Number, default: null }, // null = unlimited
  endDate:        { type: Date,   default: null },  // auto-stop after this date

  // Notification settings
  notifyBefore:   { type: Number, default: 0 },  // minutes before execution (0 = off)
  notifyAfter:    { type: Boolean, default: true },
  notifyChannels: { type: [String], default: ['email', 'push'] },

  // ── Runtime state ──
  status:         { type: String, enum: ['active', 'paused', 'cancelled', 'completed'], default: 'active' },
  executionCount: { type: Number, default: 0 },
  lastRunAt:      { type: Date,   default: null },
  nextRunAt:      { type: Date,   default: null },
  lastOrderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  lastError:      { type: String, default: null },

  // History (last 50 executions)
  executionLog:   { type: [ExecutionLogSchema], default: [] },

  // Paper / simulation mode
  isPaperTrade:   { type: Boolean, default: false },

}, { timestamps: true });

ScheduledOrderSchema.index({ status: 1, nextRunAt: 1 }); // for the cron runner query
ScheduledOrderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.models.ScheduledOrder || mongoose.models.ScheduledOrder || mongoose.model('ScheduledOrder', ScheduledOrderSchema);
