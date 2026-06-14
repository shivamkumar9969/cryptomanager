import { startBot } from '@/lib/controllers/botsController';
export async function POST(req, ctx) { return startBot(req, ctx); }
