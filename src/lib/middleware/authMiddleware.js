import jwt from 'jsonwebtoken';
import User from '../models/User';
import dbConnect from '../dbConnect';
import { NextResponse } from 'next/server';

export default async function authenticate(req) {
  await dbConnect();
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return { error: NextResponse.json({ message: 'No token, authorization denied' }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return { error: NextResponse.json({ message: "User not found" }, { status: 401 }) };
    }
    req.user = user;
    return { user };
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return { error: NextResponse.json({ message: 'Token is not valid' }, { status: 401 }) };
  }
}
