// models/Order.js
// Tracks every order placed on any exchange — manual or automated

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exchangeName: { type: String, required: true, lowercase: true },

  // Exchange-side IDs
  exchangeOrderId:  { type: String, default: null },
  clientOrderId:    { type: String, default: null }, // our idempotency key

  // Order details
  symbol:     { type: String, required: true, uppercase: true }, // e.g. BTCUSDT
  side:       { type: String, enum: ['buy', 'sell'], required: true },
  type:       { type: String, enum: ['market', 'limit', 'stop_limit', 'stop_market', 'oco'], required: true },
  status:     { type: String, enum: ['pending', 'open', 'filled', 'partially_filled', 'cancelled', 'rejected', 'expired'], default: 'pending' },

  // Amounts
  quantity:         { type: Number, required: true },  // amount in base asset
  price:            { type: Number, default: null },    // null for market orders
  stopPrice:        { type: Number, default: null },    // for stop orders
  avgFillPrice:     { type: Number, default: null },
  filledQuantity:   { type: Number, default: 0 },
  remainingQuantity:{ type: Number, default: null },

  // Fees
  fee:         { type: Number, default: 0 },
  feeCurrency: { type: String, default: null },

  // Automation source
  automationType: {
    type: String,
    enum: ['manual', 'scheduled_order', 'price_trigger', 'stop_loss', 'take_profit', 'trailing_stop', 'bot', 'chain'],
    default: 'manual'
  },
  automationId: { type: mongoose.Schema.Types.ObjectId, default: null }, // ref to ScheduledOrder / PriceTrigger / Bot
  isPaperTrade: { type: Boolean, default: false }, // simulate only

  // Timestamps
  filledAt:    { type: Date, default: null },
  cancelledAt: { type: Date, default: null },

  // Raw exchange response (for debugging)
  rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },

}, { timestamps: true });

OrderSchema.index({ userId: 1, exchangeName: 1, status: 1 });
OrderSchema.index({ userId: 1, symbol: 1 });
OrderSchema.index({ automationId: 1 });

module.exports = mongoose.models.Order || mongoose.models.Order || mongoose.model('Order', OrderSchema);
