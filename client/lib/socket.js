import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],

  autoConnect: false,

  reconnection: true,

  reconnectionAttempts: 5,

  reconnectionDelay: 1000,
});

// CONNECT HELPER
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// DISCONNECT HELPER
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
