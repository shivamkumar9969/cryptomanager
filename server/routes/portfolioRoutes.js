// server/routes/portfolioRoutes.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const portfolioController = require("../controllers/portfolioController");

router.get("/binance", authenticate, portfolioController.getBinanceBalances);
router.get("/coindcx", authenticate, portfolioController.getCoinDCXBalances);
router.get("/all", authenticate, portfolioController.getAllBalances); // NEW


module.exports = router;
