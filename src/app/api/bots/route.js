import { listBots, createBot } from '@/lib/controllers/botsController';

export async function GET(req) { return listBots(req); }
export async function POST(req) { return createBot(req); }
