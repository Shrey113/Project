import { io } from 'socket.io-client';

import { Socket_url } from './AllData';

// Create a global singleton socket instance with optimized settings
const socket = io(Socket_url, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000,
  autoConnect: true,
  forceNew: false
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server with ID:", socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Implement a reconnect mechanism
socket.on('disconnect', () => {
  console.log('Socket disconnected, attempting to reconnect...');
  setTimeout(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, 2000);
});

export default socket;
