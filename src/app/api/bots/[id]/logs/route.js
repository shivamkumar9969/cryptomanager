import { getBotLogs } from '@/lib/controllers/botsController';
export async function GET(req, ctx) { return getBotLogs(req, ctx); }
