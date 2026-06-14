import { getBot, updateBot, deleteBot } from '@/lib/controllers/botsController';

export async function GET(req, ctx) { return getBot(req, ctx); }
export async function PATCH(req, ctx) { return updateBot(req, ctx); }
export async function DELETE(req, ctx) { return deleteBot(req, ctx); }
