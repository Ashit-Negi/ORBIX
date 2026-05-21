const prisma = require("../config/db");

// GET ALL NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: currentUserId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
