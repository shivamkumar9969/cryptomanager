// models/Notification.js
// In-app notifications history (also synced with email/push)

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  
  type: {
    type: String,
    enum: [
      'info', 
      'success', 
      'warning', 
      'error', 
      'order_filled', 
      'order_failed', 
      'automation_triggered', 
      'security'
    ],
    default: 'info'
  },
  
  link: { type: String, default: null }, // URL to redirect to when clicked
  
  isRead: { type: Boolean, default: false },

}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
