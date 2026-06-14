import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
// server/controllers/exchangeController.js
import User  from '../models/User';
import { encrypt, decrypt }  from '../utils/encrypt';
import binanceService  from '../services/binanceService';
import coindcxService  from '../services/coindcxService';

/**
 * Save API keys after validating them by calling the exchange.
 * Body may contain binanceApiKey/binanceApiSecret and/or coindcxApiKey/coindcxApiSecret
 */
export const saveExchangeKeys = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { binanceApiKey, binanceApiSecret, coindcxApiKey, coindcxApiSecret } = await req.json();
    const user = await User.findById(req.user._id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Validate Binance keys if provided
    if (binanceApiKey && binanceApiSecret) {
      try {
        await binanceService.getAccountInfo(binanceApiKey, binanceApiSecret);
      } catch (err) {
        return NextResponse.json({ message: 'Binance keys invalid: ' + err.message }, { status: 400 });
      }
      user.binanceApiKey = encrypt(binanceApiKey);
      user.binanceApiSecret = encrypt(binanceApiSecret);
    }

    // Validate CoinDCX keys if provided
    if (coindcxApiKey && coindcxApiSecret) {
      try {
        await coindcxService.getAccountInfo(coindcxApiKey, coindcxApiSecret);
      } catch (err) {
        return NextResponse.json({ message: 'CoinDCX keys invalid: ' + err.message }, { status: 400 });
      }
      user.coindcxApiKey = encrypt(coindcxApiKey);
      user.coindcxApiSecret = encrypt(coindcxApiSecret);
    }

    await user.save();
    return NextResponse.json({ message: 'Keys saved and validated successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
};

/**
 * Fetch balances from exchanges using the stored (decrypted) credentials.
 * Query params: ?exchange=binance|coindcx or omit to fetch both
 */
export const getBalances = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const exchange = req.query.exchange; // optional
    const user = await User.findById(req.user._id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const result = {};

    // Binance
    if (!exchange || exchange === 'binance') {
      if (user.binanceApiKey && user.binanceApiSecret) {
        try {
          const apiKey = decrypt(user.binanceApiKey);
          const apiSecret = decrypt(user.binanceApiSecret);
          const data = await binanceService.getAccountInfo(apiKey, apiSecret);
          result.binance = data;
        } catch (err) {
          result.binance = { error: 'Failed to fetch Binance: ' + err.message };
        }
      } else {
        result.binance = { error: 'No Binance keys saved' };
      }
    }

    // CoinDCX
    if (!exchange || exchange === 'coindcx') {
      if (user.coindcxApiKey && user.coindcxApiSecret) {
        try {
          const apiKey = decrypt(user.coindcxApiKey);
          const apiSecret = decrypt(user.coindcxApiSecret);
          const data = await coindcxService.getAccountInfo(apiKey, apiSecret);
          result.coindcx = data;
        } catch (err) {
          result.coindcx = { error: 'Failed to fetch CoinDCX: ' + err.message };
        }
      } else {
        result.coindcx = { error: 'No CoinDCX keys saved' };
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
};
