import { io } from 'socket.io-client';

import { Server_url } from './AllData';

// Add error handling and connection options
const socket = io(Server_url, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});

export default socket;
