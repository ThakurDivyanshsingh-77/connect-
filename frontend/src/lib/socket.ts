import io, { Socket } from "socket.io-client";
import { API_URL } from "@/utils/config";

let socket: Socket | null = null;
let activeUserId: string | null = null;

export const getSocket = (userId?: string) => {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: true,
    });

    socket.on("connect", () => {
      if (activeUserId) {
        socket?.emit("setup", { id: activeUserId });
      }
    });
  }

  if (userId && activeUserId !== userId) {
    activeUserId = userId;

    if (socket.connected) {
      socket.emit("setup", { id: userId });
    }
  }

  return socket;
};
