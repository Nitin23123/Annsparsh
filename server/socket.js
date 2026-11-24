const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

module.exports = function buildSocketServer(httpServer) {
    const clientUrls = (process.env.CLIENT_URL || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://annsparsh.vercel.app',
        ...clientUrls,
    ];

    function isOriginAllowed(origin) {
        if (!origin) return true;
        if (allowedOrigins.includes(origin)) return true;
        if (origin.endsWith('.vercel.app')) return true;
        if (process.env.NODE_ENV !== 'production') return true;
        return false;
    }

    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (isOriginAllowed(origin)) {
                    return callback(null, true);
                }
                callback(new Error('Blocked by CORS'));
            },
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const r = await pool.query('SELECT is_verified FROM users WHERE id = $1', [decoded.id]);
            if (!r.rows.length || !r.rows[0].is_verified) return next(new Error('Not verified'));
            socket.user = decoded;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.id}`);
        socket.join(`role:${socket.user.role}`);
    });

    return io;
};
