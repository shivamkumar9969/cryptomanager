// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notificationPrefsSchema = new mongoose.Schema({
  email:    { type: Boolean, default: true },
  push:     { type: Boolean, default: true },
  telegram: { type: Boolean, default: false },
  sms:      { type: Boolean, default: false },
  // Per-event granular prefs
  onScheduledOrderFilled:  { type: Boolean, default: true },
  onPriceTriggerFired:     { type: Boolean, default: true },
  onStopLossExecuted:      { type: Boolean, default: true },
  onTakeProfitExecuted:    { type: Boolean, default: true },
  onOrderFailed:           { type: Boolean, default: true },
  onBalanceLow:            { type: Boolean, default: true },
  onBotTrade:              { type: Boolean, default: true },
  onDailySummary:          { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: null },

  // Role & plan
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  plan:     { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },

  // Verification & security
  isVerified:     { type: Boolean, default: false },
  twoFAEnabled:   { type: Boolean, default: false },
  twoFASecret:    { type: String, default: null }, // TOTP secret (encrypted)
  telegramChatId: { type: String, default: null }, // for Telegram notifications

  // Preferences
  defaultCurrency: { type: String, default: 'USDT' }, // USDT | INR | USD | EUR | BTC
  defaultExchange: { type: String, default: null },
  theme:           { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  timezone:        { type: String, default: 'Asia/Kolkata' },

  // Notification preferences
  notificationPrefs: { type: notificationPrefsSchema, default: () => ({}) },

  // Metadata
  lastLoginAt: { type: Date, default: null },
  isActive:    { type: Boolean, default: true },
  deletedAt:   { type: Date, default: null },

  // Legacy reset token (kept for backward compat)
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },

}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never return password or secrets in JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFASecret;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

module.exports = mongoose.models.User || mongoose.models.User || mongoose.model('User', UserSchema);
