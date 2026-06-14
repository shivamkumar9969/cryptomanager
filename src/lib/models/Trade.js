// models/Trade.js
// Tracks individual execution fills (trades) for P&L reporting

const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exchangeName: { type: String, required: true, lowercase: true },
  
  // IDs
  tradeId:      { type: String, required: true }, // Exchange's trade/fill ID
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  exchangeOrderId: { type: String, required: true },

  // Trade Details
  symbol:       { type: String, required: true, uppercase: true }, // e.g. BTCUSDT
  side:         { type: String, enum: ['buy', 'sell'], required: true },
  
  // Amounts
  price:        { type: Number, required: true },
  quantity:     { type: Number, required: true },
  value:        { type: Number, required: true }, // price * quantity
  
  // Fees paid for this specific fill
  fee:          { type: Number, default: 0 },
  feeCurrency:  { type: String, default: null },

  // Realized P&L (calculated only for sell trades)
  realizedPnl:  { type: Number, default: null }, 
  
  // Execution Time
  executedAt:   { type: Date, required: true },

  // Source attribution
  automationType: { type: String, default: 'manual' }, // Inherited from Order

}, { timestamps: true });

// Compound indexes
TradeSchema.index({ userId: 1, symbol: 1, executedAt: -1 });
TradeSchema.index({ userId: 1, exchangeName: 1, tradeId: 1 }, { unique: true });

module.exports = mongoose.models.Trade || mongoose.models.Trade || mongoose.model('Trade', TradeSchema);
