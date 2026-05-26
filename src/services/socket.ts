import { io, Socket } from "socket.io-client";

import { getSocketServerUrl, getSocketPath } from "../utils/runtimeConfig";

// Keep a singleton instance
let socketInstance: Socket | null = null;

export const initializeSocket = (url?: string): Socket => {
  const socketUrl = url || getSocketServerUrl();
  const socketPath = getSocketPath();

  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      path: socketPath,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return socketInstance;
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    return initializeSocket();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
