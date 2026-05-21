const prisma = require("../config/db");

// CREATE CONVERSATION
exports.createConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const { receiverId } = req.body;

    // VALIDATION
    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID is required",
      });
    }

    // SELF CHAT BLOCK
    if (currentUserId === receiverId) {
      return res.status(400).json({
        message: "You cannot message yourself",
      });
    }

    // CHECK CONNECTION
    const existingConnection = await prisma.connection.findFirst({
      where: {
        status: "ACCEPTED",

        OR: [
          {
            senderId: currentUserId,
            receiverId,
          },

          {
            senderId: receiverId,
            receiverId: currentUserId,
          },
        ],
      },
    });

    if (!existingConnection) {
      return res.status(403).json({
        message: "You can only message your connections",
      });
    }

    // CHECK EXISTING CONVERSATION
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: currentUserId,
              },
            },
          },

          {
            participants: {
              some: {
                userId: receiverId,
              },
            },
          },
        ],
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },
    });

    // RETURN EXISTING CONVERSATION
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // CREATE NEW CONVERSATION
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId: currentUserId,
            },

            {
              userId: receiverId,
            },
          ],
        },
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to create conversation",
    });
  }
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;

    const { conversationId, text } = req.body;

    // VALIDATION
    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID required",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text required",
      });
    }

    const io = req.app.get("io");

    // CHECK CONVERSATION
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // SECURITY CHECK
    const isParticipant = conversation.participants.some(
      (participant) => participant.userId === senderId,
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    // CREATE MESSAGE
    const message = await prisma.message.create({
      data: {
        text: text.trim(),

        senderId,

        conversationId,
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
      },
    });

    // UPDATE CONVERSATION
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        updatedAt: new Date(),
      },
    });

    // REALTIME MESSAGE
    io.to(conversationId).emit("receive-message", message);

    // REALTIME SIDEBAR UPDATE
    io.to(conversationId).emit("conversation-updated", {
      conversationId,
      lastMessage: message,
    });

    res.status(201).json(message);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
};

// GET USER CONVERSATIONS
exports.getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch conversations",
    });
  }
};

// GET CONVERSATION MESSAGES
exports.getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const { conversationId } = req.params;

    // CHECK CONVERSATION
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // SECURITY CHECK
    const isParticipant = conversation.participants.some(
      (participant) => participant.userId === currentUserId,
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    // GET MESSAGES
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};
