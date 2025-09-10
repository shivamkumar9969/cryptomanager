// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const apiKeySchema = new mongoose.Schema({
  exchange: { type: String, required: true },
  apiKey: { type: String, required: true },
  apiSecret: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  twoFactorAuth: { type: Boolean, default: false },
  theme: { type: String, enum: ["light", "dark"], default: "light" }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  apiKeys: [apiKeySchema],
  settings: settingsSchema,  
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.statics.getBinanceKeys = async function(userId) {
  const user = await this.findById(userId).select('apiKeys').lean();
  if (!user || !user.apiKeys) return null;
  const binanceKey = user.apiKeys.find(key => key.exchange.toLowerCase() === 'binance');
  if (!binanceKey) return null;
  return {
    apiKey: binanceKey.apiKey,
    apiSecret: binanceKey.apiSecret
  };
};


UserSchema.statics.getCoindcxKeys = async function(userId) {
  const user = await this.findById(userId).select('apiKeys').lean();
  if (!user || !user.apiKeys) return null;
  const coindcxKey = user.apiKeys.find(key => key.exchange.toLowerCase() === 'coindcx');
  if (!coindcxKey) return null;
  return {
    apiKey: coindcxKey.apiKey,
    apiSecret: coindcxKey.apiSecret
  };
};

module.exports = mongoose.model('User', UserSchema);
