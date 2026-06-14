// models/Alert.js
// General notifications and price alerts that do NOT execute orders

const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // What kind of alert is this?
  type: { 
    type: String, 
    enum: ['price', 'portfolio_value', 'portfolio_drop', 'exchange_disconnect'],
    required: true 
  },

  // Target config (depends on type)
  symbol:       { type: String, default: null }, // e.g. "BTCUSDT" for price alerts
  exchangeName: { type: String, default: 'all' }, // specific exchange or all

  // Condition
  condition: { 
    type: String, 
    enum: ['above', 'below', 'drops_by_pct', 'rises_by_pct'],
    required: true 
  },
  threshold:    { type: Number, required: true },
  currency:     { type: String, default: 'USDT' }, // currency of the threshold

  // Delivery channels
  channels:     { type: [String], default: ['email', 'push'] },

  // Runtime State
  isActive:     { type: Boolean, default: true },
  isTriggered:  { type: Boolean, default: false }, // for one-time alerts
  isRecurring:  { type: Boolean, default: false }, // if true, resets after triggering
  cooldownHours:{ type: Number, default: 24 },     // wait time before re-triggering (for recurring)

  // Trigger history
  lastTriggeredAt: { type: Date, default: null },
  triggerCount:    { type: Number, default: 0 },

}, { timestamps: true });

AlertSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.models.Alert || mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
