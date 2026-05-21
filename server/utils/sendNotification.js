const prisma = require("../config/db");

const sendNotification = async ({
  io,

  type,

  senderId,

  receiverId,

  postId = null,

  commentId = null,

  communityId = null,

  connectionId = null,

  message,
}) => {
  try {
    // SAVE IN DB
    const notification = await prisma.notification.create({
      data: {
        type,

        message,

        senderId,

        receiverId,

        postId,

        commentId,

        communityId,

        connectionId,
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // REALTIME EMIT
    io.to(receiverId).emit("new-notification", {
      ...notification,

      message,
    });

    return notification;
  } catch (error) {
    console.log("Notification Error:", error);
  }
};

module.exports = sendNotification;
