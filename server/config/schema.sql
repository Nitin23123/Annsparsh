-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('DONOR', 'NGO', 'ADMIN')) NOT NULL DEFAULT 'DONOR',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    food_type VARCHAR(255) NOT NULL,
    quantity VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    best_before INTEGER NOT NULL,
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('AVAILABLE', 'CLAIMED', 'COLLECTED', 'COMPLETED', 'EXPIRED')) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    donation_id INTEGER REFERENCES donations(id) ON DELETE CASCADE,
    ngo_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    volunteer_name VARCHAR(255),
    volunteer_phone VARCHAR(20),
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(50),
    otp VARCHAR(6),
    otp_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Idempotent migrations for existing databases
ALTER TABLE requests ADD COLUMN IF NOT EXISTS otp_attempts INTEGER DEFAULT 0;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS otp_issued_at TIMESTAMP;

-- User verification migrations
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Phone OTPs table for SMS / mobile verification
CREATE TABLE IF NOT EXISTS phone_otps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Grievance and Misconduct Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reported_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reported_name VARCHAR(255),
    reported_role VARCHAR(20) CHECK (reported_role IN ('DONOR', 'NGO', 'VOLUNTEER', 'OTHER')),
    donation_id INTEGER REFERENCES donations(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Seed admin user (password: password)
INSERT INTO users (name, email, password_hash, role, is_verified)
VALUES (
    'Admin',
    'admin@annsparsh.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ADMIN',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Demo accounts backing the one-click demo logins on /auth (password: password123).
-- The NGO is seeded verified so the demo can claim donations without an admin
-- first working the verification queue.
INSERT INTO users (name, email, password_hash, role, is_verified)
VALUES
    (
        'Demo Donor',
        'donor@example.com',
        '$2b$10$Zah9NYqA/PktsRyiF.7mxeDOg8qrZvAnnzKV0ddTWELku2Gqwnxgu',
        'DONOR',
        TRUE
    ),
    (
        'Demo Relief NGO',
        'ngo@example.com',
        '$2b$10$Zah9NYqA/PktsRyiF.7mxeDOg8qrZvAnnzKV0ddTWELku2Gqwnxgu',
        'NGO',
        TRUE
    )
ON CONFLICT (email) DO NOTHING;
