import { getPnlReport, getTradePerformance, getFeeSummary } from '@/lib/controllers/reportsController';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'pnl';
  if (type === 'pnl') return getPnlReport(req);
  if (type === 'trades') return getTradePerformance(req);
  if (type === 'fees') return getFeeSummary(req);
  return NextResponse.json({ message: 'Unknown report type' }, { status: 400 });
}
