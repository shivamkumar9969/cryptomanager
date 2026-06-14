import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import Trade from '../models/Trade';
import jwt from 'jsonwebtoken';

function getUserId(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
}

export const getPnlReport = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ? new Date(searchParams.get('from')) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = searchParams.get('to') ? new Date(searchParams.get('to')) : new Date();

    const trades = await Trade.find({ userId, executedAt: { $gte: from, $lte: to } }).sort({ executedAt: 1 });

    let totalFees = 0;
    let totalBuy = 0;
    let totalSell = 0;
    const bySymbol = {};
    const byDay = {};

    trades.forEach(t => {
      const fee = t.fee || 0;
      totalFees += fee;
      const val = t.quantity * t.price;

      if (t.side === 'buy') totalBuy += val;
      else totalSell += val;

      if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { symbol: t.symbol, buy: 0, sell: 0, fees: 0, net: 0 };
      bySymbol[t.symbol][t.side === 'buy' ? 'buy' : 'sell'] += val;
      bySymbol[t.symbol].fees += fee;

      const day = t.executedAt.toISOString().split('T')[0];
      if (!byDay[day]) byDay[day] = { date: day, pnl: 0 };
      byDay[day].pnl += t.side === 'sell' ? val - fee : -(val + fee);
    });

    // Compute net per symbol
    Object.values(bySymbol).forEach(s => { s.net = s.sell - s.buy - s.fees; });

    const netPnl = totalSell - totalBuy - totalFees;
    const timeline = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: { netPnl, totalBuy, totalSell, totalFees, tradeCount: trades.length },
      bySymbol: Object.values(bySymbol).sort((a, b) => b.net - a.net),
      timeline,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};

export const getTradePerformance = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const trades = await Trade.find({ userId }).sort({ executedAt: -1 }).limit(200);
    const byExchange = {};
    trades.forEach(t => {
      if (!byExchange[t.exchangeName]) byExchange[t.exchangeName] = { exchange: t.exchangeName, count: 0, totalFees: 0 };
      byExchange[t.exchangeName].count++;
      byExchange[t.exchangeName].totalFees += t.fee || 0;
    });
    return NextResponse.json({ trades: trades.slice(0, 50), byExchange: Object.values(byExchange) });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};

export const getFeeSummary = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const trades = await Trade.find({ userId });
    const byExchange = {};
    trades.forEach(t => {
      const ex = t.exchangeName || 'Unknown';
      if (!byExchange[ex]) byExchange[ex] = { exchange: ex, totalFees: 0, count: 0, currency: t.feeCurrency || 'USDT' };
      byExchange[ex].totalFees += t.fee || 0;
      byExchange[ex].count++;
    });
    const totalFees = trades.reduce((s, t) => s + (t.fee || 0), 0);
    return NextResponse.json({ totalFees, byExchange: Object.values(byExchange) });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};
