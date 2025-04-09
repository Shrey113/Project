import { io } from 'socket.io-client';


import { Socket_url } from './AllData';


const socket = io(Socket_url, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000
});

socket.on("connect", () => {
  // console.log("Conne  cted to WebSocket server");
});


socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
