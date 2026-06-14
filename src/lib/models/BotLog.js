const mongoose = require('mongoose');

const botLogSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // 'started', 'stopped', 'order_placed', 'order_filled', 'error'
  details: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  pnl: { type: Number, default: 0 },
  symbol: String,
  side: String,
  quantity: Number,
  price: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.BotLog || mongoose.model('BotLog', botLogSchema);
