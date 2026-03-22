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
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, is_verified)
VALUES (
    'Admin',
    'admin@annsparsh.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ADMIN',
    TRUE
) ON CONFLICT (email) DO NOTHING;
