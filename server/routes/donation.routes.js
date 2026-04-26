const router = require('express').Router();
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Create donation (DONOR only)
router.post('/', authMiddleware, requireRole('DONOR'), async (req, res) => {
    const { food_type, quantity, address, best_before, notes } = req.body;
    if (!food_type || !quantity || !address || !best_before) {
        return res.status(400).json({ error: 'food_type, quantity, address, best_before are required' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO donations (donor_id, food_type, quantity, address, best_before, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.id, food_type, quantity, address, best_before, notes || null]
        );
        const donation = result.rows[0];
        req.app.get('io').to('role:NGO').emit('donation:available', { donation });
        res.status(201).json(donation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get available donations (NGO)
router.get('/available', authMiddleware, requireRole('NGO'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, u.name AS donor_name
             FROM donations d
             JOIN users u ON d.donor_id = u.id
             WHERE d.status = 'AVAILABLE'
             ORDER BY d.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get donor's own donations
router.get('/mine', authMiddleware, requireRole('DONOR'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*,
                (SELECT COUNT(*) FROM requests r WHERE r.donation_id = d.id AND r.status = 'PENDING') AS pending_requests
             FROM donations d
             WHERE d.donor_id = $1
             ORDER BY d.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single donation with its requests (DONOR)
router.get('/:id/requests', authMiddleware, requireRole('DONOR'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.name AS ngo_name, u.email AS ngo_email
             FROM requests r
             JOIN users u ON r.ngo_id = u.id
             WHERE r.donation_id = $1
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update donation status (DONOR)
router.put('/:id/status', authMiddleware, requireRole('DONOR'), async (req, res) => {
    const { status } = req.body;
    const allowed = ['COLLECTED', 'COMPLETED', 'EXPIRED'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }
    try {
        const result = await pool.query(
            `UPDATE donations SET status = $1
             WHERE id = $2 AND donor_id = $3
             RETURNING *`,
            [status, req.params.id, req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Donation not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete donation (DONOR, only if AVAILABLE)
router.delete('/:id', authMiddleware, requireRole('DONOR'), async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM donations WHERE id = $1 AND donor_id = $2 AND status = 'AVAILABLE' RETURNING id`,
            [req.params.id, req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Donation not found or already claimed' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
