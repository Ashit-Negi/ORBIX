const prisma = require("../config/db");

// GET ALL NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: currentUserId,
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            image: true,
            name: true,
          },
        },
        post: { select: { id: true } },

        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

exports.markNotificationsAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    await prisma.notification.updateMany({
      where: {
        receiverId: currentUserId,
        read: false,
      },

      data: {
        read: true,
      },
    });

    res.json({
      message: "Notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
