const router = require('express').Router();
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const adminOnly = [authMiddleware, requireRole('ADMIN')];

// Get all users
router.get('/users', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify / unverify a user
router.put('/users/:id/verify', ...adminOnly, async (req, res) => {
    const { is_verified } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET is_verified = $1 WHERE id = $2 RETURNING id, name, email, role, is_verified`,
            [is_verified, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all donations with donor info
router.get('/donations', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, u.name AS donor_name, u.email AS donor_email,
                (SELECT COUNT(*) FROM requests r WHERE r.donation_id = d.id) AS total_requests
             FROM donations d
             JOIN users u ON d.donor_id = u.id
             ORDER BY d.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all requests with full info
router.get('/requests', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, d.food_type, d.quantity, d.status AS donation_status,
                    u_ngo.name AS ngo_name, u_donor.name AS donor_name
             FROM requests r
             JOIN donations d ON r.donation_id = d.id
             JOIN users u_ngo ON r.ngo_id = u_ngo.id
             JOIN users u_donor ON d.donor_id = u_donor.id
             ORDER BY r.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stats summary
router.get('/stats', ...adminOnly, async (req, res) => {
    try {
        const [users, donations, requests, completed] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM users WHERE role != 'ADMIN'`),
            pool.query(`SELECT COUNT(*) FROM donations`),
            pool.query(`SELECT COUNT(*) FROM requests`),
            pool.query(`SELECT COUNT(*) FROM donations WHERE status = 'COMPLETED'`),
        ]);
        res.json({
            total_users: parseInt(users.rows[0].count),
            total_donations: parseInt(donations.rows[0].count),
            total_requests: parseInt(requests.rows[0].count),
            completed_donations: parseInt(completed.rows[0].count),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
