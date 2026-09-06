const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Optional auth helper for filing reports
function optionalAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch {
            // Proceed without authenticated user
        }
    }
    next();
}

// File a grievance / incident report
router.post('/', optionalAuth, async (req, res) => {
    const {
        reported_role,
        reported_name,
        reported_user_id,
        donation_id,
        category,
        severity = 'MEDIUM',
        description
    } = req.body;

    if (!category || !description || !description.trim()) {
        return res.status(400).json({ error: 'Category and description are required' });
    }

    const validRoles = ['DONOR', 'NGO', 'VOLUNTEER', 'OTHER'];
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const validCategories = ['FOOD_QUALITY', 'NO_SHOW', 'MISCONDUCT', 'FRAUD', 'OTHER'];

    const reportRole = validRoles.includes(reported_role) ? reported_role : 'OTHER';
    const reportSeverity = validSeverities.includes(severity) ? severity : 'MEDIUM';
    const reportCategory = validCategories.includes(category) ? category : 'OTHER';
    const reporterId = req.user ? req.user.id : null;

    try {
        const result = await pool.query(
            `INSERT INTO reports (
                reporter_id, reported_user_id, reported_name, reported_role,
                donation_id, category, severity, description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                reporterId,
                reported_user_id || null,
                reported_name ? reported_name.trim() : null,
                reportRole,
                donation_id || null,
                reportCategory,
                reportSeverity,
                description.trim()
            ]
        );

        const report = result.rows[0];

        // Notify admins via socket if connected
        try {
            const io = req.app.get('io');
            if (io) {
                io.to('role:ADMIN').emit('report:created', { report });
            }
        } catch (socketErr) {
            // Non-blocking socket error
        }

        res.status(201).json({
            success: true,
            ticket: `REP-${String(report.id).padStart(5, '0')}`,
            report
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get reports filed by the logged-in user
router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, d.food_type, d.quantity
             FROM reports r
             LEFT JOIN donations d ON r.donation_id = d.id
             WHERE r.reporter_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all reports with filtering
router.get('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    const { status, category, severity } = req.query;

    let query = `
        SELECT r.*,
               u_rep.name AS reporter_name, u_rep.email AS reporter_email, u_rep.role AS reporter_role,
               u_target.name AS target_user_name, u_target.email AS target_user_email,
               d.food_type, d.quantity AS donation_quantity
        FROM reports r
        LEFT JOIN users u_rep ON r.reporter_id = u_rep.id
        LEFT JOIN users u_target ON r.reported_user_id = u_target.id
        LEFT JOIN donations d ON r.donation_id = d.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        params.push(status);
        query += ` AND r.status = $${params.length}`;
    }
    if (category) {
        params.push(category);
        query += ` AND r.category = $${params.length}`;
    }
    if (severity) {
        params.push(severity);
        query += ` AND r.severity = $${params.length}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update report resolution status and add notes
router.put('/:id/status', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    const { status, admin_notes, action } = req.body;
    const validStatuses = ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid report status' });
    }

    try {
        const resolvedAt = ['RESOLVED', 'DISMISSED'].includes(status) ? new Date() : null;

        const updateRes = await pool.query(
            `UPDATE reports
             SET status = $1,
                 admin_notes = COALESCE($2, admin_notes),
                 resolved_at = $3
             WHERE id = $4
             RETURNING *`,
            [status, admin_notes || null, resolvedAt, req.params.id]
        );

        if (!updateRes.rows.length) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = updateRes.rows[0];

        // Optional disciplinary action: suspend or revoke verification of reported user
        if (action === 'REVOKE_VERIFICATION' && report.reported_user_id) {
            await pool.query(
                `UPDATE users
                 SET is_verified = FALSE,
                     verification_status = 'REJECTED',
                     rejection_reason = $1
                 WHERE id = $2`,
                [`Account suspended following grievance review (Report #${report.id})`, report.reported_user_id]
            );
        }

        res.json({
            success: true,
            report
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
