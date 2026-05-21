const { Server } = require("socket.io");

const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER ONLINE
    socket.on("join-user-room", (userId) => {
      socket.join(userId);

      onlineUsers.set(userId, socket.id);

      console.log(`User joined room: ${userId}`);

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // JOIN CONVERSATION
    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);

      console.log(`Joined conversation: ${conversationId}`);
    });

    // LEAVE CONVERSATION
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(conversationId);

      console.log(`Left conversation: ${conversationId}`);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

module.exports = initializeSocket;
