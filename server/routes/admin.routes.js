const router = require('express').Router();
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const adminOnly = [authMiddleware, requireRole('ADMIN')];

// Get all users with full verification attributes
router.get('/users', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, is_verified, phone, phone_verified,
                    id_type, id_number, id_document_url, verification_status, rejection_reason, created_at
             FROM users
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify / unverify a user (toggle)
router.put('/users/:id/verify', ...adminOnly, async (req, res) => {
    const { is_verified } = req.body;
    try {
        const newStatus = is_verified ? 'VERIFIED' : 'UNVERIFIED';
        const result = await pool.query(
            `UPDATE users
             SET is_verified = $1,
                 verification_status = $2,
                 rejection_reason = NULL
             WHERE id = $3
             RETURNING id, name, email, role, is_verified, verification_status`,
            [is_verified, newStatus, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin formal verification decision (APPROVE or REJECT with reason)
router.put('/users/:id/verification-decision', ...adminOnly, async (req, res) => {
    const { decision, rejection_reason } = req.body;
    if (!['APPROVE', 'REJECT'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be APPROVE or REJECT' });
    }

    try {
        const isVerified = decision === 'APPROVE';
        const verificationStatus = isVerified ? 'VERIFIED' : 'REJECTED';
        const reason = isVerified ? null : (rejection_reason || 'Verification documents did not meet requirements.');

        const result = await pool.query(
            `UPDATE users
             SET is_verified = $1,
                 verification_status = $2,
                 rejection_reason = $3
             WHERE id = $4
             RETURNING id, name, email, role, is_verified, verification_status, rejection_reason`,
            [isVerified, verificationStatus, reason, req.params.id]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json({
            success: true,
            user: result.rows[0]
        });
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

// Stats summary including pending verifications & pending reports
router.get('/stats', ...adminOnly, async (req, res) => {
    try {
        const [users, donations, requests, completed, pendingVerifications, pendingReports] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM users WHERE role != 'ADMIN'`),
            pool.query(`SELECT COUNT(*) FROM donations`),
            pool.query(`SELECT COUNT(*) FROM requests`),
            pool.query(`SELECT COUNT(*) FROM donations WHERE status = 'COMPLETED'`),
            pool.query(`SELECT COUNT(*) FROM users WHERE is_verified = FALSE AND role != 'ADMIN'`),
            pool.query(`SELECT COUNT(*) FROM reports WHERE status = 'PENDING'`),
        ]);
        res.json({
            total_users: parseInt(users.rows[0].count),
            total_donations: parseInt(donations.rows[0].count),
            total_requests: parseInt(requests.rows[0].count),
            completed_donations: parseInt(completed.rows[0].count),
            pending_verifications: parseInt(pendingVerifications.rows[0].count),
            pending_reports: parseInt(pendingReports.rows[0].count),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
