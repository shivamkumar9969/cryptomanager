import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import axios  from "axios";

const fetchBinancePrices = async () => {
    console.log('fetchBinancePrices called');
  try {
    const res = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
    return res.data.map((c) => (
        console.log('binance response', c),
    {
      symbol: c.symbol,
      lastPrice: parseFloat(c.lastPrice),
      priceChange: parseFloat(c.priceChange),
      priceChangePercent: parseFloat(c.priceChangePercent),
      highPrice: parseFloat(c.highPrice),
      lowPrice: parseFloat(c.lowPrice),
      volume: parseFloat(c.volume),
      quoteVolume: parseFloat(c.quoteVolume),
      bidPrice: parseFloat(c.bidPrice),
      askPrice: parseFloat(c.askPrice),
    }));
  } catch (err) {
    console.error("Binance API error:", err.message);
    return [];
  }
};


const fetchCoinDCXPrices = async () => {
    console.log('fetchCoinDCXPrices called');
  try {
    const res = await axios.get("https://api.coindcx.com/exchange/ticker");
    return res.data.map((c) => ({
      symbol: c.market.toUpperCase(),
      lastPrice: parseFloat(c.last_price),
      priceChange: parseFloat(c.change) || 0,
      priceChangePercent: parseFloat(c.percent_change) || 0,
      highPrice: parseFloat(c.high) || 0,
      lowPrice: parseFloat(c.low) || 0,
      volume: parseFloat(c.volume) || 0,
      bidPrice: parseFloat(c.buy) || 0,
      askPrice: parseFloat(c.sell) || 0,
    }));
  } catch (err) {
    console.error("CoinDCX API error:", err.message);
    return [];
  }
};


// Controller: getPrices
export const getPrices = async (req) => {
  await dbConnect();
  const exchange = req.query.exchange;
  console.log('getPrices called for exchange:', exchange);
  try {
    let coins = [];
    if (exchange === "Binance") {
      coins = await fetchBinancePrices();
    } else if (exchange === "CoinDCX") {
      coins = await fetchCoinDCXPrices();
    } else {
      return NextResponse.json({ error: "Invalid exchange" }, { status: 400 });
    }
    return NextResponse.json(coins);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
};
