const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const authenticate = require("../middleware/authMiddleware");

// Get user settings
router.get("/", authenticate, settingsController.getSettings);

// Update user settings
router.put("/", authenticate, settingsController.updateSettings);

module.exports = router;

