import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import ExchangeKey from '../models/ExchangeKey';
import binanceService from '../services/binanceService';
import coindcxService from '../services/coindcxService';
import { decrypt } from '../services/encryptionService';

export const getBinanceBalances = async (req) => {
  await dbConnect();
  try {
    const userId = req.user.id;
    const { searchParams } = new URL(req.url);
    const selectedCurrency = searchParams.get("currency") || "USDT";
    
    let binancePortfolio = null;
    const binanceKey = await ExchangeKey.findOne({ userId, exchangeName: 'binance', isActive: true });
    if (binanceKey) {
      const apiKey = decrypt(binanceKey.apiKey);
      const apiSecret = decrypt(binanceKey.apiSecret);
      binancePortfolio = await binanceService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }
    return NextResponse.json({ binance: binancePortfolio });
  } catch (err) {
    console.error("Binance error:", err.message);
    return NextResponse.json({ message: "Failed to fetch Binance balances" }, { status: 500 });
  }
};

export const getCoinDCXBalances = async (req) => {
  await dbConnect();
  try {
    const userId = req.user.id;
    const { searchParams } = new URL(req.url);
    const selectedCurrency = searchParams.get("currency") || "USDT";
    
    let coindcxPortfolio = null;
    const coindcxKey = await ExchangeKey.findOne({ userId, exchangeName: 'coindcx', isActive: true });
    if (coindcxKey) {
      const apiKey = decrypt(coindcxKey.apiKey);
      const apiSecret = decrypt(coindcxKey.apiSecret);
      coindcxPortfolio = await coindcxService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }    
    return NextResponse.json({ coindcx: coindcxPortfolio });
  } catch (err) {
    console.error("CoinDCX error:", err.message);
    return NextResponse.json({ message: "Failed to fetch CoinDCX balances" }, { status: 500 });
  }
};

export const getAllBalances = async (req) => {
  await dbConnect();
  try {
    const userId = req.user.id;
    const { searchParams } = new URL(req.url);
    const selectedCurrency = searchParams.get("currency") || "USDT";
    
    let binancePortfolio = null;
    let coindcxPortfolio = null;
    
    const binanceKey = await ExchangeKey.findOne({ userId, exchangeName: 'binance', isActive: true });
    const coindcxKey = await ExchangeKey.findOne({ userId, exchangeName: 'coindcx', isActive: true });
    
    if (coindcxKey) {
      const apiKey = decrypt(coindcxKey.apiKey);
      const apiSecret = decrypt(coindcxKey.apiSecret);
      coindcxPortfolio = await coindcxService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }
    if (binanceKey) {
      const apiKey = decrypt(binanceKey.apiKey);
      const apiSecret = decrypt(binanceKey.apiSecret);
      binancePortfolio = await binanceService.getPortfolioValueForUser(apiKey, apiSecret, selectedCurrency);
    }
    return NextResponse.json({
      binance: binancePortfolio,
      coindcx: coindcxPortfolio,
    });
  } catch (err) {
    console.error("Error in getAllBalances:", err.message);
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
};
