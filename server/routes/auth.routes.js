const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role, phone, id_type, id_number } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    if (!['DONOR', 'NGO'].includes(role)) {
        return res.status(400).json({ error: 'Role must be DONOR or NGO' });
    }
    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        
        // Initial status:
        // Donors start as UNVERIFIED until mobile OTP is confirmed (or verified immediately if admin/demo).
        // NGOs start as UNVERIFIED pending mobile OTP and Govt ID verification.
        const verification_status = 'UNVERIFIED';
        const is_verified = false;

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, phone, id_type, id_number, is_verified, verification_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, name, email, role, phone, phone_verified, id_type, id_number, id_document_url, is_verified, verification_status`,
            [name, email, password_hash, role, phone || null, id_type || null, id_number || null, is_verified, verification_status]
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                phone_verified: user.phone_verified,
                id_type: user.id_type,
                id_number: user.id_number,
                id_document_url: user.id_document_url,
                is_verified: user.is_verified,
                verification_status: user.verification_status || (user.is_verified ? 'VERIFIED' : 'PENDING'),
                rejection_reason: user.rejection_reason
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, phone, phone_verified, id_type, id_number, id_document_url,
                    is_verified, verification_status, rejection_reason, created_at
             FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Mobile / SMS OTP
router.post('/send-phone-otp', authMiddleware, async (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 8) {
        return res.status(400).json({ error: 'Valid phone number is required' });
    }
    const cleanPhone = phone.trim();
    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        // Save phone to user profile if not set
        await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [cleanPhone, req.user.id]);

        // Insert new OTP record with 10-minute expiry
        await pool.query(
            `INSERT INTO phone_otps (user_id, phone, otp_code, expires_at)
             VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
            [req.user.id, cleanPhone, otpCode]
        );

        // In production this would trigger SMS via Twilio/Fast2SMS/MSG91.
        // For development and testing, return OTP directly so testers can test immediately.
        res.json({
            success: true,
            message: `OTP sent successfully to ${cleanPhone}`,
            phone: cleanPhone,
            otp: otpCode
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Mobile OTP
router.post('/verify-phone-otp', authMiddleware, async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and 6-digit OTP code are required' });
    }
    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    try {
        const otpCheck = await pool.query(
            `SELECT * FROM phone_otps
             WHERE user_id = $1 AND phone = $2 AND otp_code = $3 AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [req.user.id, cleanPhone, cleanOtp]
        );

        if (!otpCheck.rows.length) {
            return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new code.' });
        }

        // Delete used OTPs for this user
        await pool.query('DELETE FROM phone_otps WHERE user_id = $1', [req.user.id]);

        // Fetch current user details
        const userRes = await pool.query('SELECT role, id_type, id_number FROM users WHERE id = $1', [req.user.id]);
        const currentUser = userRes.rows[0];

        // If user is a DONOR, phone verification completes their instant verification!
        // If user is an NGO, phone is verified and they progress to Govt ID review
        let isVerified = false;
        let newStatus = 'OTP_VERIFIED';

        if (currentUser.role === 'DONOR') {
            isVerified = true;
            newStatus = 'VERIFIED';
        } else if (currentUser.role === 'NGO') {
            newStatus = (currentUser.id_type && currentUser.id_number) ? 'PENDING_REVIEW' : 'OTP_VERIFIED';
        }

        const updateRes = await pool.query(
            `UPDATE users
             SET phone = $1, phone_verified = TRUE, is_verified = $2, verification_status = $3, rejection_reason = NULL
             WHERE id = $4
             RETURNING id, name, email, role, phone, phone_verified, id_type, id_number, id_document_url, is_verified, verification_status`,
            [cleanPhone, isVerified, newStatus, req.user.id]
        );

        res.json({
            success: true,
            message: currentUser.role === 'DONOR' 
                ? 'Mobile verified! Donor account is active.' 
                : 'Mobile number verified successfully!',
            user: updateRes.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Govt ID & Registration details
router.post('/submit-verification', authMiddleware, async (req, res) => {
    const { id_type, id_number, id_document_url, phone } = req.body;
    if (!id_type || !id_number) {
        return res.status(400).json({ error: 'ID Type and ID / Registration Number are required' });
    }

    try {
        const userRes = await pool.query('SELECT role, phone_verified FROM users WHERE id = $1', [req.user.id]);
        if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' });
        const user = userRes.rows[0];

        // For NGOs, submitting ID details places them in PENDING_REVIEW for Admin audit
        // For Donors, having phone verified + ID auto-activates or places in review
        const newStatus = (user.role === 'DONOR' && user.phone_verified) ? 'VERIFIED' : 'PENDING_REVIEW';
        const isVerified = (user.role === 'DONOR' && user.phone_verified);

        const result = await pool.query(
            `UPDATE users
             SET id_type = $1, id_number = $2, id_document_url = $3,
                 phone = COALESCE($4, phone),
                 verification_status = $5,
                 is_verified = $6,
                 rejection_reason = NULL
             WHERE id = $7
             RETURNING id, name, email, role, phone, phone_verified, id_type, id_number, id_document_url, is_verified, verification_status`,
            [id_type.trim(), id_number.trim(), id_document_url || null, phone ? phone.trim() : null, newStatus, isVerified, req.user.id]
        );

        res.json({
            success: true,
            message: user.role === 'NGO' 
                ? 'Govt ID documents submitted for admin verification' 
                : 'Verification details updated successfully',
            user: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
