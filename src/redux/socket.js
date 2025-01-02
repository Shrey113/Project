
import { io } from 'socket.io-client';

import { Server_url } from './AllData';

const socket = io(Server_url);


export default socket;
