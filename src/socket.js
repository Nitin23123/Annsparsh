import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
    auth: (cb) => cb({ token: localStorage.getItem('token') || '' }),
    withCredentials: true,
});

socket.on('connect_error', (err) => {
    if (err.message === 'Invalid token' || err.message === 'No token' || err.message === 'Not verified') {
        return;
    }
});

export default socket;
