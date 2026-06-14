import { listAlerts, createAlert } from '@/lib/controllers/alertsController';

export async function GET(req) { return listAlerts(req); }
export async function POST(req) { return createAlert(req); }
