import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import binanceService from "../services/binanceService";
import coindcxService from "../services/coindcxService";
import ExchangeKey from "../models/ExchangeKey";
import { decrypt } from "../services/encryptionService";

export const dashboardSummary = async (req) => {
  await dbConnect();
  try {
    const userId = req.user.id;
    const { searchParams } = new URL(req.url);
    const selectedCurrency = searchParams.get("currency") || "USDT";
    let binancePortfolio = [];
    let coindcxPortfolio = [];

    const binanceKey = await ExchangeKey.findOne({ userId, exchangeName: 'binance', isActive: true });
    const coindcxKey = await ExchangeKey.findOne({ userId, exchangeName: 'coindcx', isActive: true });

    // ✅ Get Binance portfolio (if connected)
    if (binanceKey) {
      const apiKey = decrypt(binanceKey.apiKey);
      const apiSecret = decrypt(binanceKey.apiSecret);
      const portfolio = await binanceService.getPortfolioValueForUser(
        apiKey,
        apiSecret,
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
      const apiKey = decrypt(coindcxKey.apiKey);
      const apiSecret = decrypt(coindcxKey.apiSecret);
      const portfolio = await coindcxService.getPortfolioValueForUser(
        apiKey,
        apiSecret,
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

    return NextResponse.json({
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
    return NextResponse.json({ error: "Could not get dashboard summary." }, { status: 500 });
  }
};
