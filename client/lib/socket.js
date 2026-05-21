import { io } from "socket.io-client";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
  {
    transports: ["websocket"],

    autoConnect: false,

    reconnection: true,

    reconnectionAttempts: 5,

    reconnectionDelay: 1000,
  },
);

export default socket;
