const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationsAsRead,
} = require("../controllers/notificationController");

// GET NOTIFICATIONS
router.get("/", authMiddleware, getNotifications);

// MARK NOTIFICATIONS AS READ
router.put("/read", authMiddleware, markNotificationsAsRead);

module.exports = router;
