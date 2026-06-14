import { pauseBot } from '@/lib/controllers/botsController';
export async function POST(req, ctx) { return pauseBot(req, ctx); }
