import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
    auth: {
        token: localStorage.getItem('token') || '',
    },
    withCredentials: true,
});

// Refresh token on reconnect (token may have changed)
socket.on('connect', () => {
    socket.auth = { token: localStorage.getItem('token') || '' };
});

export default socket;
