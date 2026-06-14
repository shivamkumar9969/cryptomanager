import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import User from '../models/User';
import Otp from '../models/Otp';
import bcrypt from 'bcryptjs';
import sendOtpEmail from '../utils/sendOtp';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const register = async (req) => {
  await dbConnect();
  let { name, email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });

  try {
    const verifiedUser = await User.findOne({ email, isVerified: true });
    if (verifiedUser)
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });

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
    return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const verifyOtp = async (req) => {
  await dbConnect();
  let { name, email, otp } = await req.json();

  if (!email || !otp)
    return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });

  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    if (record.expiresAt < Date.now())
      return NextResponse.json({ message: 'OTP expired' }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ message: 'No registration found. Please register first.' }, { status: 400 });
    if (user.isVerified)
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });

    if (name) user.name = name;
    user.isVerified = true;
    await user.save();
    await Otp.deleteOne({ email });

    return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const login = async (req) => {
  await dbConnect();
  let { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    if (!user.isVerified)
      return NextResponse.json({ message: 'Registration incomplete, please register again' }, { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const getMe = async (req) => {
  await dbConnect();
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -resetToken -resetTokenExpiry');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
};

export const forgotPassword = async (req) => {
  await dbConnect();
  let { email } = await req.json();
  try {
    const user = await User.findOne({ email, isVerified: true });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 400 });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    await sendOtpEmail(email, `Click here to reset your password: ${resetLink}`);
    return NextResponse.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const resetPassword = async (req) => {
  await dbConnect();
  let { email, token, newPassword } = await req.json();
  try {
    const user = await User.findOne({
      email,
      isVerified: true,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({ message: 'Password reset successful' });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
