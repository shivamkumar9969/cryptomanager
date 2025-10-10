const binanceService = require("../services/binanceService");
const coindcxService = require("../services/coindcxService");
const User = require("../models/User");

exports.dashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedCurrency = req.query.currency || "USDT";

    const user = await User.findById(userId);
    let binancePortfolio = [];
    let coindcxPortfolio = [];

    const binanceKey = user.apiKeys.find(
      (k) => k.exchange.toLowerCase() === "binance"
    );
    const coindcxKey = user.apiKeys.find(
      (k) => k.exchange.toLowerCase() === "coindcx"
    );

    // ✅ Get Binance portfolio (if connected)
    if (binanceKey) {
      const portfolio = await binanceService.getPortfolioValueForUser(
        binanceKey.apiKey,
        binanceKey.apiSecret,
        selectedCurrency
      );

      // Add `platform` to each Binance asset
      binancePortfolio = portfolio.map((a) => ({
        ...a,
        platform: "Binance",
      }));
    }

    // ✅ Get CoinDCX portfolio (if connected)
    if (coindcxKey) {
      const portfolio = await coindcxService.getPortfolioValueForUser(
        coindcxKey.apiKey,
        coindcxKey.apiSecret,
        selectedCurrency
      );

      // Add `platform` to each CoinDCX asset
      coindcxPortfolio = portfolio.map((a) => ({
        ...a,
        platform: "CoinDCX",
      }));
    }

    // ✅ Combine after adding platform info
    const combinedAssets = [...binancePortfolio, ...coindcxPortfolio];

    // ✅ Merge same assets from both platforms
    const mergedAssets = combinedAssets.reduce((acc, asset) => {
      const existing = acc.find((a) => a.asset === asset.asset);
      if (existing) {
        existing.quantity += asset.quantity;
        existing.value += asset.value;
        if (!existing.platforms.includes(asset.platform)) {
          existing.platforms.push(asset.platform);
        }
      } else {
        acc.push({
          asset: asset.asset,
          quantity: asset.quantity,
          value: asset.value,
          platforms: [asset.platform],
        });
      }
      return acc;
    }, []);

    // ✅ Total value
    const totalValue = mergedAssets.reduce((sum, a) => sum + a.value, 0);

    // ✅ Exchange summary
    const exchanges = [
      {
        name: "Binance",
        connected: !!binanceKey,
        balancesValue: binancePortfolio.reduce((s, a) => s + a.value, 0),
        lastSync: new Date().toISOString(),
      },
      {
        name: "CoinDCX",
        connected: !!coindcxKey,
        balancesValue: coindcxPortfolio.reduce((s, a) => s + a.value, 0),
        lastSync: new Date().toISOString(),
      },
    ];

    // ✅ Dummy activity (replace later)
    const recentActivity = mergedAssets.slice(0, 5).map((a) => ({
      exchange: a.platforms[0],
      type: "Balance Update",
      asset: a.asset,
      amount: a.quantity,
      date: new Date().toISOString(),
    }));
    res.json({
      success: true,
      data: {
        totalBalance: totalValue,
        exchanges,
        topAssets: mergedAssets.sort((a, b) => b.value - a.value),
        recentActivity,
      },
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Could not get dashboard summary." });
  }
};
