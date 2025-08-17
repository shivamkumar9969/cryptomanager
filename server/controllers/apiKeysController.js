//apiKeysController.js
const User = require("../models/User");

exports.getApiKeys = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("apiKeys");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.apiKeys);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addApiKey = async (req, res) => {
  const { exchange, apiKey, apiSecret } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: prevent duplicates per exchange by filtering existing keys
    user.apiKeys = user.apiKeys.filter((k) => k.exchange !== exchange);

    user.apiKeys.push({ exchange, apiKey, apiSecret });
    await user.save();
    res.status(201).json({ message: "API key added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteApiKey = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.apiKeys = user.apiKeys.filter((key) => key._id.toString() !== id);
    await user.save();
    res.json({ message: "API key deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
