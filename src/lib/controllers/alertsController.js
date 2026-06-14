import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import Alert from '../models/Alert';
import jwt from 'jsonwebtoken';

function getUserId(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
}

export const listAlerts = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ alerts });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 401 });
  }
};

export const createAlert = async (req) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const body = await req.json();
    // body: { type, coin, condition, threshold, currency, channels }
    const alert = await Alert.create({ ...body, userId, isTriggered: false });
    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const updateAlert = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const alert = await Alert.findOneAndUpdate({ _id: params.id, userId }, body, { new: true });
    if (!alert) return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
    return NextResponse.json({ alert });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const deleteAlert = async (req, { params }) => {
  await dbConnect();
  try {
    const userId = getUserId(req);
    const alert = await Alert.findOneAndDelete({ _id: params.id, userId });
    if (!alert) return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
    return NextResponse.json({ message: 'Alert deleted' });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
