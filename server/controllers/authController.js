// controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const sendOtpEmail = require('../utils/sendOtp');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const verifiedUser = await User.findOne({ email, isVerified: true });
    if (verifiedUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      { name, email, password: hashedPassword, isVerified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otpCode);
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { name, email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No registration found. Please register first." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (name) user.name = name;
    user.isVerified = true;
    await user.save();

    await Otp.deleteOne({ email });

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Invalid credentials" });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ message: "Registration incomplete, please register again" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('forget', email);
  try {
    const user = await User.findOne({ email, isVerified: true });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; 

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    await sendOtpEmail(
      email,
      `Click here to reset your password: ${resetLink}`
    );

    return res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      isVerified: true,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


