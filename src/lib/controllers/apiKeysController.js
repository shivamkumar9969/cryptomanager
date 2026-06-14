import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import User from "../models/User";
import ExchangeKey from "../models/ExchangeKey";
import { encrypt, decrypt } from "../services/encryptionService";

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '****';
  return `****${key.slice(-4)}`;
}

export const getApiKeys = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const keys = await ExchangeKey.find({ userId: req.user.id });
    const maskedKeys = keys.map(k => {
      let decryptedKey = '';
      try {
        decryptedKey = decrypt(k.apiKey);
      } catch (err) {
        decryptedKey = 'error';
      }
      return {
        _id: k._id,
        exchange: k.exchangeName,
        apiKey: maskKey(decryptedKey),
        createdAt: k.createdAt
      };
    });
    return NextResponse.json(maskedKeys);
  } catch (err) {
    console.error("Get API Keys error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};

export const addApiKey = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { exchange, apiKey, apiSecret } = await req.json();
    if (!exchange || !apiKey || !apiSecret) {
      return NextResponse.json({ message: "Exchange, API key, and Secret are required" }, { status: 400 });
    }

    const userId = req.user.id;

    // Validate the keys by trying to get accounts info
    try {
      if (exchange.toLowerCase() === 'binance') {
        const BinanceAdapter = require('../services/exchanges/binanceService');
        const adapter = new BinanceAdapter(apiKey, apiSecret);
        await adapter.getBalances();
      } else if (exchange.toLowerCase() === 'coindcx') {
        const CoindcxAdapter = require('../services/exchanges/coindcxService');
        const adapter = new CoindcxAdapter(apiKey, apiSecret);
        await adapter.getBalances();
      } else {
        return NextResponse.json({ message: "Unsupported exchange" }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json({ message: `API Key validation failed: ${err.message}` }, { status: 400 });
    }

    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);

    // Deactivate existing active keys for this exchange
    await ExchangeKey.updateMany({ userId, exchangeName: exchange.toLowerCase() }, { isActive: false });

    await ExchangeKey.create({
      userId,
      exchangeName: exchange.toLowerCase(),
      apiKey: encryptedKey,
      apiSecret: encryptedSecret,
      isActive: true,
      isValid: true,
      lastTestedAt: new Date()
    });

    return NextResponse.json({ message: "API key added and validated successfully" }, { status: 201 });
  } catch (err) {
    console.error("Add API key error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
};

export const deleteApiKey = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const resolvedParams = await params;
    let id = null;
    if (resolvedParams?.action) {
      if (resolvedParams.action.length > 1 && resolvedParams.action[0] === 'delete') {
        id = resolvedParams.action[1];
      } else {
        id = resolvedParams.action[0];
      }
    }
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const result = await ExchangeKey.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!result) {
      return NextResponse.json({ message: "API key not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
};
