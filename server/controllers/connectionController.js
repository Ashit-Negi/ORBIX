const prisma = require("../config/db");
const sendNotification = require("../utils/sendNotification");

// SEND CONNECTION REQUEST
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const receiverId = req.params.userId;

    // SELF REQUEST CHECK
    if (senderId === receiverId) {
      return res.status(400).json({
        message: "You cannot connect with yourself",
      });
    }

    // CHECK USER EXISTS
    const userExists = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });

    if (!userExists) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // CHECK EXISTING REQUEST
    const existingRequest = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Connection already exists or pending",
      });
    }

    // CREATE REQUEST
    const connection = await prisma.connection.create({
      data: {
        senderId,
        receiverId,
      },
    });

    // CREATE NOTIFICATION
    const io = req.app.get("io");

    await sendNotification({
      io,

      type: "CONNECTION_REQUEST",

      senderId,

      receiverId,

      connectionId: connection.id,

      message: `${req.user.username} sent you a connection request`,
    });

    res.status(201).json({
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// ACCEPT CONNECTION REQUEST
exports.acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    const currentUserId = req.user.userId;

    // FIND REQUEST
    const request = await prisma.connection.findUnique({
      where: {
        id: requestId,
      },

      include: {
        sender: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // SECURITY CHECK
    if (request.receiverId !== currentUserId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // UPDATE STATUS
    // UPDATE STATUS
    const updatedRequest = await prisma.connection.update({
      where: {
        id: requestId,
      },

      data: {
        status: "ACCEPTED",
      },
    });

    // SOCKET EVENT
    const io = req.app.get("io");

    io.to(request.senderId).emit("connection-updated", {
      profileId: request.senderId,

      action: "INCREMENT",
    });

    io.to(currentUserId).emit("connection-updated", {
      profileId: currentUserId,

      action: "INCREMENT",
    });

    // DELETE OLD REQUEST NOTIFICATION
    await prisma.notification.deleteMany({
      where: {
        connectionId: updatedRequest.id,

        type: "CONNECTION_REQUEST",
      },
    });

    // SENDER NOTIFICATION
    await sendNotification({
      io,

      type: "CONNECTION_ACCEPTED",

      senderId: currentUserId,

      receiverId: request.senderId,

      connectionId: updatedRequest.id,

      message: `${req.user.username} accepted your connection request`,
    });

    // RECEIVER NOTIFICATION
    await sendNotification({
      io,

      type: "CONNECTION_ACCEPTED",

      senderId: request.senderId,

      receiverId: currentUserId,

      connectionId: updatedRequest.id,

      message: `You are now connected with ${request.sender.username}`,
    });

    res.json({
      message: "Connection accepted",

      connection: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET CONNECTION STATUS
exports.getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const otherUserId = req.params.userId;

    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
      },
    });

    if (!connection) {
      return res.json({
        status: "NONE",
      });
    }

    res.json({
      status: connection.status,
      connection,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET PENDING REQUESTS
exports.getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const requests = await prisma.connection.findMany({
      where: {
        receiverId: currentUserId,

        status: "PENDING",
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
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
// REMOVE CONNECTION
exports.removeConnection = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const otherUserId = req.params.userId;

    // FIND CONNECTION
    const connection = await prisma.connection.findFirst({
      where: {
        status: "ACCEPTED",

        OR: [
          {
            senderId: currentUserId,

            receiverId: otherUserId,
          },

          {
            senderId: otherUserId,

            receiverId: currentUserId,
          },
        ],
      },
    });

    if (!connection) {
      return res.status(404).json({
        message: "Connection not found",
      });
    }

    // CURRENT USER
    const currentUser = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },

      select: {
        username: true,
      },
    });

    // DELETE CONNECTION
    await prisma.connection.delete({
      where: {
        id: connection.id,
      },
    });

    // SOCKET
    const io = req.app.get("io");

    // REALTIME CONNECTION UPDATE
    io.to(otherUserId).emit("connection-updated", {
      profileId: otherUserId,

      action: "DECREMENT",
    });

    io.to(currentUserId).emit("connection-updated", {
      profileId: currentUserId,

      action: "DECREMENT",
    });
    // REALTIME NOTIFICATION
    await sendNotification({
      io,

      type: "CONNECTION_REMOVED",

      senderId: currentUserId,

      receiverId: otherUserId,

      connectionId: connection.id,

      message: `${currentUser.username} removed the connection`,
    });

    res.json({
      message: "Connection removed",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET ACCEPTED CONNECTIONS
exports.getAcceptedConnections = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const connections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",

        OR: [
          {
            senderId: currentUserId,
          },

          {
            receiverId: currentUserId,
          },
        ],
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },

        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const formattedConnections = connections.map((connection) => {
      const otherUser =
        connection.senderId === currentUserId
          ? connection.receiver
          : connection.sender;

      return otherUser;
    });

    res.json(formattedConnections);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
