import { NextResponse } from 'next/server';
import * as controller from '@/lib/controllers/exchangeController';
import authenticate from '@/lib/middleware/authMiddleware';

const routeMap = {
  "POST": {
    "keys": controller.saveExchangeKeys
  },
  "GET": {
    "balances": controller.getBalances
  }
};

async function handleRequest(req, { params }) {
  const resolvedParams = await params;
  const actionPath = resolvedParams.action.join('/');
  const method = req.method;
  
  // Find matching route for this method and path
  let handler;
  if (routeMap[method] && routeMap[method][actionPath]) {
    handler = routeMap[method][actionPath];
  } else if (routeMap[method]) {
    // try matching parameters like /delete/123 -> map might not match
    // For simplicity, if action length > 1, and action[0] is in map, use it.
    if (resolvedParams.action.length > 1 && routeMap[method][resolvedParams.action[0]]) {
      handler = routeMap[method][resolvedParams.action[0]];
    } else if (routeMap[method]['/']) {
      // root match
      handler = routeMap[method]['/'];
    }
  }

  if (handler) {
    
    const auth = await authenticate(req);
    if (auth?.error) return auth.error;
    
    return handler(req, { params: resolvedParams });
  }

  return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function GET(req, { params }) { return handleRequest(req, { params }); }
export async function POST(req, { params }) { return handleRequest(req, { params }); }
export async function PUT(req, { params }) { return handleRequest(req, { params }); }
export async function DELETE(req, { params }) { return handleRequest(req, { params }); }
export async function PATCH(req, { params }) { return handleRequest(req, { params }); }
