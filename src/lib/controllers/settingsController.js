import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import User from "../models/User";

export const getSettings = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const user = await User.findById(req.user.id).select("settings");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user.settings || { twoFactorAuth: false, theme: "light" });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
};

export const updateSettings = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { twoFactorAuth, theme } = await req.json();

    const user = await User.findById(req.user.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Default settings object
    if (!user.settings) {
      user.settings = { twoFactorAuth: false, theme: "light" };
    }

    // Update only provided fields
    if (typeof twoFactorAuth !== "undefined") {
      user.settings.twoFactorAuth = twoFactorAuth;
    }
    if (theme) {
      user.settings.theme = theme;
    }

    await user.save();

    return NextResponse.json({ message: "Settings updated successfully", settings: user.settings });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
};
