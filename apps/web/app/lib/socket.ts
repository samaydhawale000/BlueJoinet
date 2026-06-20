import { io } from "socket.io-client";

export const socket = io("http://localhost:3005", {
  autoConnect: false,
  transports: ["websocket"],
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}