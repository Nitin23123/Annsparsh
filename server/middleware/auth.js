const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}

// The JWT only carries id and role, so verification status has to be read fresh —
// otherwise a token minted before admin approval would keep working, and one
// minted before a revocation would too.
async function requireVerified(req, res, next) {
    try {
        const { rows } = await pool.query('SELECT is_verified FROM users WHERE id = $1', [req.user.id]);
        if (!rows.length) return res.status(401).json({ error: 'Account no longer exists' });
        if (!rows[0].is_verified) {
            return res.status(403).json({
                error: 'Your organisation is awaiting admin verification.',
                code: 'NOT_VERIFIED',
            });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { authMiddleware, requireRole, requireVerified };
