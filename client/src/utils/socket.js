import { io } from "socket.io-client";

let socket = null;

export const initSocket = (userId) => {
  if (socket) socket.disconnect();

  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    socket.emit("join", userId);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};