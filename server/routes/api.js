// server/routes/api.js
const express = require("express");
const router = express.Router();
const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");

router.get("/binance/account", async (req, res) => {
    try {
        const data = await binanceService.getAccountInfo();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Binance API error" });
    }
});

router.get("/coindcx/account", async (req, res) => {
    try {
        const data = await coindcxService.getAccountInfo();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "CoinDCX API error" });
    }
});

module.exports = router;
