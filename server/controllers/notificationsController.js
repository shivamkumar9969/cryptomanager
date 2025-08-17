// server/controllers/notificationsController.js
const Notification = require("../models/Notification");

// Fetch all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Get count of unread notifications
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      read: false 
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Get unread count error:", err.message);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all read error:", err.message);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};
