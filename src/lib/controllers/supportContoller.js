import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
import Support from '../models/support';

export const saveSupport = async (req, { params } = {}) => {
  await dbConnect();
  try {
    let { contactForm } = await req.json();
    const userId = req.user.id;

    if (!contactForm) {
      return NextResponse.json({
        success: false,
        message: "contactForm is required",
      }, { status: 400 });
    }
    const { name, email, message } = contactForm;

    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        message: "Name, email and message are required",
      }, { status: 400 });
    }

    const support = new Support({
      user_id: userId,
      name,
      email,
      message,
    });
    await support.save();
    return NextResponse.json({
      success: true,
      message: "Message Saved",
    }, { status: 200 });
    
  } catch (err) {
    console.error("Save support error:", err);
    return NextResponse.json({ message: 'Failed to save the support message', error: err.message }, { status: 500 });
  }
};