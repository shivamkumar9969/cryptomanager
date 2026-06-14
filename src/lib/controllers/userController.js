import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import User from "../models/User";
import ExchangeKey from "../models/ExchangeKey";
import coindcxService from "../services/coindcxService";
import { decrypt } from "../services/encryptionService";

async function getCoinDCXUserInfo(apiKey, apiSecret) {
  try {
    // Note: coindcxService doesn't have getUserInfo in the adapter, but let's check
    // if coindcxService implements it, or fallback.
    if (typeof coindcxService.getUserInfo === 'function') {
      return await coindcxService.getUserInfo(apiKey, apiSecret);
    }
    return null;
  } catch (err) {
    console.error("CoinDCX getUserInfo error:", err.message);
    return null; 
  }
}

export const getProfile = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    let coindcxUserInfo = null;
    const coindcxKey = await ExchangeKey.findOne({ userId: req.user.id, exchangeName: 'coindcx', isActive: true });
    if (coindcxKey) {
      const apiKey = decrypt(coindcxKey.apiKey);
      const apiSecret = decrypt(coindcxKey.apiSecret);
      coindcxUserInfo = await getCoinDCXUserInfo(apiKey, apiSecret);
    }
    return NextResponse.json({
      user,
      coindcxUserInfo, 
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// Update profile (name/email)
export const updateProfile = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { name, email } = await req.json();
    const user = await User.findById(req.user.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    return NextResponse.json({ name: user.name, email: user.email });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// Change password
export const changePassword = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { currentPassword, newPassword } = await req.json();
    const user = await User.findById(req.user.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });

    user.password = newPassword; // will hash via pre-save middleware
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
