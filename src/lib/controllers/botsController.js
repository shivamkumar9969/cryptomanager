import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import Bot from '../models/Bot';
import BotLog from '../models/BotLog';
import jwt from 'jsonwebtoken';

function getUserId(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
}

export const listBots = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const bots = await Bot.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ bots });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};

export const createBot = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const bot = await Bot.create({ ...body, userId });
    await BotLog.create({ botId: bot._id, userId, action: 'created', details: `Bot "${bot.name}" created` });
    return NextResponse.json({ bot }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const getBot = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const bot = await Bot.findOne({ _id: params.id, userId });
    if (!bot) return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    return NextResponse.json({ bot });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};

export const updateBot = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const bot = await Bot.findOneAndUpdate({ _id: params.id, userId }, body, { new: true });
    if (!bot) return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    return NextResponse.json({ bot });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const deleteBot = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const bot = await Bot.findOneAndDelete({ _id: params.id, userId });
    if (!bot) return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    await BotLog.deleteMany({ botId: params.id });
    return NextResponse.json({ message: 'Bot deleted' });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const startBot = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const bot = await Bot.findOneAndUpdate(
      { _id: params.id, userId },
      { status: 'active', startedAt: new Date() },
      { new: true }
    );
    if (!bot) return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    await BotLog.create({ botId: bot._id, userId, action: 'started', details: `Bot "${bot.name}" started` });
    return NextResponse.json({ bot });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const pauseBot = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const bot = await Bot.findOneAndUpdate(
      { _id: params.id, userId },
      { status: 'paused' },
      { new: true }
    );
    if (!bot) return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    await BotLog.create({ botId: bot._id, userId, action: 'paused', details: `Bot "${bot.name}" paused` });
    return NextResponse.json({ bot });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const stopBot = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const bot = await Bot.findOneAndUpdate(
      { _id: params.id, userId },
      { status: 'stopped', stoppedAt: new Date() },
      { new: true }
    );
    if (!bot) return NextResponse.json({ message: 'Bot not found' }, { status: 404 });
    await BotLog.create({ botId: bot._id, userId, action: 'stopped', details: `Bot "${bot.name}" stopped` });
    return NextResponse.json({ bot });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const getBotLogs = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const logs = await BotLog.find({ botId: params.id, userId })
      .sort({ timestamp: -1 })
      .limit(limit);
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};
