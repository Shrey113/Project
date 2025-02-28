import { io } from 'socket.io-client';

import { Server_url } from './AllData';


const socket = io(Server_url, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
