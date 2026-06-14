import { stopBot } from '@/lib/controllers/botsController';
export async function POST(req, ctx) { return stopBot(req, ctx); }
