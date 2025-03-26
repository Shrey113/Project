import { io } from 'socket.io-client';


import { Socket_url } from './AllData';


const socket = io(Socket_url, {
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
  timeout: 5000,
});
console.log("socket url", socket);

socket.on("connect", () => {
  console.log("Conne  cted to WebSocket server");
});


socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
