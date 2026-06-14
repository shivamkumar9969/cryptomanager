// models/PriceTrigger.js
// ⭐ Core automation: auto buy/sell when price crosses a target
// Handles: price alerts with orders, stop-loss, take-profit, trailing stop

const mongoose = require('mongoose');

const TriggerLogSchema = new mongoose.Schema({
  evaluatedAt:    { type: Date, required: true },
  currentPrice:   { type: Number, required: true },
  peakPrice:      { type: Number, default: null }, // for trailing stop tracking
  triggered:      { type: Boolean, default: false },
  orderId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  status:         { type: String, enum: ['checked', 'triggered', 'order_placed', 'order_failed', 'paper'], default: 'checked' },
  error:          { type: String, default: null },
}, { _id: false });

const PriceTriggerSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:         { type: String, required: true, trim: true }, // "BTC Stop-Loss at 58k"
  description:  { type: String, default: '' },

  // Category — helps UI group and label these triggers
  category: {
    type: String,
    enum: ['stop_loss', 'take_profit', 'price_target', 'trailing_stop', 'dip_buy', 'breakout'],
    default: 'price_target'
  },

  // Exchange & coin
  exchangeName:  { type: String, required: true, lowercase: true },
  exchangeKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeKey', required: true },
  symbol:        { type: String, required: true, uppercase: true }, // "BTCUSDT"

  // What to do when triggered
  side:       { type: String, enum: ['buy', 'sell'], required: true },
  orderType:  { type: String, enum: ['market', 'limit'], default: 'market' },
  limitPrice: { type: Number, default: null }, // place limit at this price if orderType=limit

  // Amount
  amountType: { type: String, enum: ['currency', 'quantity', 'percentage'], required: true },
  amount:     { type: Number, required: true },

  // ── Trigger condition ──
  triggerType: {
    type: String,
    enum: [
      'price_lte',       // trigger when price ≤ value  (e.g. buy dip, stop-loss sell)
      'price_gte',       // trigger when price ≥ value  (e.g. take profit sell, breakout buy)
      'pct_drop',        // trigger when price drops X% from referencePrice
      'pct_rise',        // trigger when price rises X% from referencePrice
      'trailing_stop',   // trigger when price drops X% from peakPrice (tracks peak)
      'pct_from_avg',    // trigger when price is X% above/below user's avg buy price
    ],
    required: true
  },

  // The threshold value:
  // - For price_lte / price_gte: absolute price in triggerCurrency
  // - For pct_drop / pct_rise / trailing_stop / pct_from_avg: percentage number (e.g. 10 = 10%)
  triggerValue:    { type: Number, required: true },
  triggerCurrency: { type: String, default: 'USDT' }, // currency of triggerValue for price_lte/gte

  // Reference price at creation time (used for pct_drop, pct_rise calculations)
  referencePrice:  { type: Number, default: null },

  // Trailing stop: tracks highest (for sell) or lowest (for buy) price seen
  peakPrice:       { type: Number, default: null },
  peakPriceAt:     { type: Date,   default: null },

  // ── Behavior after triggering ──
  isRecurring:     { type: Boolean, default: false }, // re-arm after firing
  cooldownMinutes: { type: Number, default: 60 },     // minutes before re-arming

  // Chain to next trigger after this one fires
  // e.g. after stop-loss fires → create take-profit on the new position
  chainToTriggerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceTrigger', default: null },

  // ── Validity ──
  expiresAt: { type: Date, default: null }, // auto-cancel if not triggered by this date

  // ── Related position (for stop-loss / take-profit) ──
  // Track the original buy order this is protecting
  linkedOrderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  avgBuyPrice:    { type: Number, default: null }, // user's avg buy price for pct_from_avg

  // ── Notifications ──
  notifyOnTrigger: { type: Boolean, default: true },
  notifyOnFill:    { type: Boolean, default: true },
  notifyChannels:  { type: [String], default: ['email', 'push'] },

  // ── Runtime state ──
  status: {
    type: String,
    enum: ['active', 'triggered', 'expired', 'cancelled', 'paused', 'completed'],
    default: 'active'
  },
  lastCheckedAt:    { type: Date, default: null },
  lastCheckedPrice: { type: Number, default: null },
  triggeredAt:      { type: Date, default: null },
  triggeredPrice:   { type: Number, default: null },
  triggeredOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  rearmedAt:        { type: Date, default: null }, // last time it re-armed (recurring)
  triggerCount:     { type: Number, default: 0 },  // how many times it fired

  // Evaluation log (last 100 checks)
  triggerLog: { type: [TriggerLogSchema], default: [] },

  // Paper / simulation mode
  isPaperTrade: { type: Boolean, default: false },

}, { timestamps: true });

PriceTriggerSchema.index({ status: 1, exchangeName: 1 }); // for price monitor loop
PriceTriggerSchema.index({ userId: 1, status: 1, symbol: 1 });
PriceTriggerSchema.index({ expiresAt: 1 }, { sparse: true }); // for expiry cleanup

module.exports = mongoose.models.PriceTrigger || mongoose.models.PriceTrigger || mongoose.model('PriceTrigger', PriceTriggerSchema);
