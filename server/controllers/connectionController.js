const prisma = require("../config/db");
const { connect } = require("../routes/authRoutes");

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
    await prisma.notification.create({
      data: {
        type: "CONNECTION_REQUEST",

        message: `${req.user.username} sent you a connection request`,

        receiverId: receiverId,
      },
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
    const updatedRequest = await prisma.connection.update({
      where: {
        id: requestId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    // CREATE ACCEPT NOTIFICATION
    await prisma.notification.create({
      data: {
        type: "CONNECTION_ACCEPTED",

        message: `${req.user.username} accepted your connection request`,

        receiverId: request.senderId,
        connectionId: connection.id,
      },
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
