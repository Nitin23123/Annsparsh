const router = require('express').Router();
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// NGO: submit a request for a donation
router.post('/', authMiddleware, requireRole('NGO'), async (req, res) => {
    const { donation_id } = req.body;
    if (!donation_id) return res.status(400).json({ error: 'donation_id is required' });
    try {
        // Check donation is still available
        const donation = await pool.query(
            `SELECT * FROM donations WHERE id = $1 AND status = 'AVAILABLE'`,
            [donation_id]
        );
        if (!donation.rows.length) {
            return res.status(400).json({ error: 'Donation not available' });
        }
        // Check NGO hasn't already requested this
        const existing = await pool.query(
            `SELECT id FROM requests WHERE donation_id = $1 AND ngo_id = $2`,
            [donation_id, req.user.id]
        );
        if (existing.rows.length) {
            return res.status(409).json({ error: 'You already requested this donation' });
        }
        const result = await pool.query(
            `INSERT INTO requests (donation_id, ngo_id) VALUES ($1, $2) RETURNING *`,
            [donation_id, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NGO: get own requests
router.get('/mine', authMiddleware, requireRole('NGO'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, d.food_type, d.quantity, d.address, d.best_before, d.status AS donation_status,
                    u.name AS donor_name
             FROM requests r
             JOIN donations d ON r.donation_id = d.id
             JOIN users u ON d.donor_id = u.id
             WHERE r.ngo_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DONOR: get all incoming requests across all their donations
router.get('/incoming', authMiddleware, requireRole('DONOR'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, d.food_type, d.quantity, d.address,
                    u.name AS ngo_name, u.email AS ngo_email
             FROM requests r
             JOIN donations d ON r.donation_id = d.id
             JOIN users u ON r.ngo_id = u.id
             WHERE d.donor_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DONOR: approve or reject a request
router.put('/:id', authMiddleware, requireRole('DONOR'), async (req, res) => {
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
    }
    try {
        // Verify this request belongs to one of the donor's donations
        const check = await pool.query(
            `SELECT r.* FROM requests r
             JOIN donations d ON r.donation_id = d.id
             WHERE r.id = $1 AND d.donor_id = $2`,
            [req.params.id, req.user.id]
        );
        if (!check.rows.length) return res.status(404).json({ error: 'Request not found' });

        const request = check.rows[0];
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        await pool.query(`UPDATE requests SET status = $1 WHERE id = $2`, [newStatus, req.params.id]);

        // If approved, mark donation as CLAIMED and reject all other pending requests
        if (action === 'APPROVE') {
            await pool.query(`UPDATE donations SET status = 'CLAIMED' WHERE id = $1`, [request.donation_id]);
            await pool.query(
                `UPDATE requests SET status = 'REJECTED' WHERE donation_id = $1 AND id != $2 AND status = 'PENDING'`,
                [request.donation_id, req.params.id]
            );
        }

        res.json({ message: `Request ${newStatus}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NGO: assign volunteer to an approved request (generates OTP)
router.put('/:id/volunteer', authMiddleware, requireRole('NGO'), async (req, res) => {
    const { volunteer_name, volunteer_phone, vehicle_type, vehicle_number } = req.body;
    if (!volunteer_name || !volunteer_phone || !vehicle_type || !vehicle_number) {
        return res.status(400).json({ error: 'All volunteer fields are required' });
    }
    try {
        // Verify this request belongs to this NGO and is APPROVED
        const check = await pool.query(
            `SELECT * FROM requests WHERE id = $1 AND ngo_id = $2 AND status = 'APPROVED'`,
            [req.params.id, req.user.id]
        );
        if (!check.rows.length) return res.status(404).json({ error: 'Approved request not found' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

        const result = await pool.query(
            `UPDATE requests SET volunteer_name=$1, volunteer_phone=$2, vehicle_type=$3, vehicle_number=$4, otp=$5
             WHERE id = $6 RETURNING *`,
            [volunteer_name, volunteer_phone, vehicle_type, vehicle_number, otp, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DONOR: verify OTP to confirm food collected
router.post('/:id/verify-otp', authMiddleware, requireRole('DONOR'), async (req, res) => {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });
    try {
        const check = await pool.query(
            `SELECT r.* FROM requests r
             JOIN donations d ON r.donation_id = d.id
             WHERE r.id = $1 AND d.donor_id = $2 AND r.status = 'APPROVED'`,
            [req.params.id, req.user.id]
        );
        if (!check.rows.length) return res.status(404).json({ error: 'Request not found' });

        const request = check.rows[0];
        if (request.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

        // Mark OTP verified, donation as COLLECTED
        await pool.query(`UPDATE requests SET otp_verified = TRUE WHERE id = $1`, [req.params.id]);
        await pool.query(`UPDATE donations SET status = 'COLLECTED' WHERE id = $1`, [request.donation_id]);

        res.json({ message: 'OTP verified. Food marked as collected.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
