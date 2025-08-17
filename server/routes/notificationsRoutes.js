// server/routes/notificationsRoutes.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const notificationsController = require("../controllers/notificationsController");

router.get("/", authenticate, notificationsController.getNotifications);
router.get("/unread-count", authenticate, notificationsController.getUnreadCount);
router.patch("/mark-all-read", authenticate, notificationsController.markAllRead);

module.exports = router;
