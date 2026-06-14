import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import User from "../models/User";
import ExchangeKey from "../models/ExchangeKey";
import binanceService from "../services/binanceService";
import coindcxService from "../services/coindcxService";
import { decrypt } from "../services/encryptionService";

export const placeOrder = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { exchange, symbol, side, type, price, quantity } = await req.json();

    const userId = req.user.id;
    const keyData = await ExchangeKey.findOne({ userId, exchangeName: exchange.toLowerCase(), isActive: true });
    if (!keyData) return NextResponse.json({ message: `${exchange} API key not found` }, { status: 400 });

    const apiKey = decrypt(keyData.apiKey);
    const apiSecret = decrypt(keyData.apiSecret);

    let result;
    if (exchange.toLowerCase() === "binance") {
      result = await binanceService.placeOrder(apiKey, apiSecret, {
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        type: type.toUpperCase(),
        quantity,
        ...(type.toUpperCase() === "LIMIT" && { price, timeInForce: "GTC" }),
      });
    } else if (exchange.toLowerCase() === "coindcx") {
      result = await coindcxService.placeOrder(apiKey, apiSecret, {
        market: symbol.toLowerCase(),
        side: side.toLowerCase(),
        type: type.toLowerCase(),
        price,
        quantity,
      });
    } else {
      return NextResponse.json({ message: "Unsupported exchange" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Place order error:", err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const getOrders = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const exchange = searchParams.get('exchange');
    const symbol = searchParams.get('symbol');
    const market = searchParams.get('market') || searchParams.get('symbol');

    if (!exchange) {
      return NextResponse.json({ message: "Exchange parameter is required" }, { status: 400 });
    }

    const userId = req.user.id;
    const keyData = await ExchangeKey.findOne({ userId, exchangeName: exchange.toLowerCase(), isActive: true });
    if (!keyData) return NextResponse.json({ message: `${exchange} API key not found` }, { status: 400 });

    const apiKey = decrypt(keyData.apiKey);
    const apiSecret = decrypt(keyData.apiSecret);

    let result;
    if (exchange.toLowerCase() === "binance") {
      if (!symbol) return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
      result = await binanceService.getAllOrders(apiKey, apiSecret, symbol.toUpperCase());
    } else if (exchange.toLowerCase() === "coindcx") {
      if (!market) return NextResponse.json({ message: "Market parameter is required" }, { status: 400 });
      result = await coindcxService.getOrders(apiKey, apiSecret, market.toLowerCase());
    } else {
      return NextResponse.json({ message: "Unsupported exchange" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Get orders error:", err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const cancelOrder = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { exchange, symbol, orderId } = await req.json();

    const userId = req.user.id;
    const keyData = await ExchangeKey.findOne({ userId, exchangeName: exchange.toLowerCase(), isActive: true });
    if (!keyData) return NextResponse.json({ message: `${exchange} API key not found` }, { status: 400 });

    const apiKey = decrypt(keyData.apiKey);
    const apiSecret = decrypt(keyData.apiSecret);

    let result;
    if (exchange.toLowerCase() === "binance") {
      if (!symbol || !orderId) return NextResponse.json({ message: "Symbol and orderId are required" }, { status: 400 });
      result = await binanceService.cancelOrder(apiKey, apiSecret, symbol.toUpperCase(), orderId);
    } else if (exchange.toLowerCase() === "coindcx") {
      if (!orderId) return NextResponse.json({ message: "OrderId is required" }, { status: 400 });
      result = await coindcxService.cancelOrder(apiKey, apiSecret, orderId);
    } else {
      return NextResponse.json({ message: "Unsupported exchange" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Cancel order error:", err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
