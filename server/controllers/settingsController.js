const User = require("../models/User");

// Get settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("settings");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.settings || { twoFactorAuth: false, theme: "light" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const { twoFactorAuth, theme } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

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

    res.json({ message: "Settings updated successfully", settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getSettings, updateSettings };
