import { io } from 'socket.io-client';


import { Socket_url } from './AllData';


const socket = io(Socket_url, {
  origin: '*',
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
