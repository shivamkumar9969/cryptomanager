const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const tradingController = require("../controllers/tradingContoller");

router.get("/prices", authenticate, tradingController.getPrices);

module.exports = router;
