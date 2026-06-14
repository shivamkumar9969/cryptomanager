import { updateAlert, deleteAlert } from '@/lib/controllers/alertsController';

export async function PATCH(req, ctx) { return updateAlert(req, ctx); }
export async function DELETE(req, ctx) { return deleteAlert(req, ctx); }
