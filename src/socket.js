import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Adjust if deployed

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
});

export default socket;
