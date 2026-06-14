import { NextResponse } from 'next/server';
import dbConnect from '../dbConnect';
// server/controllers/notificationsController.js
import Notification  from "../models/Notification";

// Fetch all notifications for the logged-in user
export const getNotifications = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err.message);
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 });
  }
};

// Get count of unread notifications
export const getUnreadCount = async (req, { params } = {}) => {
  await dbConnect();
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      read: false 
    });
    return NextResponse.json({ unreadCount: count });
  } catch (err) {
    console.error("Get unread count error:", err.message);
    return NextResponse.json({ message: "Failed to get unread count" }, { status: 500 });
  }
};

// Mark all notifications as read
export const markAllRead = async (req, { params } = {}) => {
  await dbConnect();
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all read error:", err.message);
    return NextResponse.json({ message: "Failed to mark as read" }, { status: 500 });
  }
};
