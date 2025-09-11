//contollers/UserContoller
const User = require("../models/User");
const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");

async function getCoinDCXUserInfo(apiKey, apiSecret) {
  try {
    const data = await coindcxService.getUserInfo(apiKey, apiSecret);
    return data; 
  } catch (err) {
    console.error("CoinDCX error:", err.message);
    return null; 
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let coindcxUserInfo = null;
    const coindcxKey = user.apiKeys.find((k) => k.exchange === "coindcx");
    if (coindcxKey) {
      const apiKey = coindcxKey.apiKey;
      const apiSecret = coindcxKey.apiSecret;
      coindcxUserInfo = await getCoinDCXUserInfo(apiKey, apiSecret);
    }
     res.json({
      user,
      coindcxUserInfo, 
    })
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Update profile (name/email)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword; // will hash via pre-save middleware
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


