require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/donations', require('./routes/donation.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/reports', require('./routes/report.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const { createServer } = require('http');
const buildSocketServer = require('./socket');

const httpServer = createServer(app);
const io = buildSocketServer(httpServer);
app.set('io', io);

const PORT = process.env.PORT || 5000;

// schema.sql is idempotent (CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING),
// so applying it on boot keeps tables and the seeded demo accounts in sync without
// a manual psql step.
async function applySchema() {
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/db');
    const sql = fs.readFileSync(path.join(__dirname, 'config', 'schema.sql'), 'utf8');
    await pool.query(sql);
}

// Sweep past-freshness listings out of the feed even when nobody is browsing.
const EXPIRY_SWEEP_MS = 5 * 60 * 1000;

function startExpirySweep() {
    const { expireStaleDonations } = require('./lib/expiry');
    const sweep = () =>
        expireStaleDonations()
            .then((n) => n && console.log(`Expired ${n} stale donation(s)`))
            .catch((err) => console.error('Expiry sweep failed:', err.message));
    sweep();
    setInterval(sweep, EXPIRY_SWEEP_MS).unref();
}

applySchema()
    .then(() => console.log('Schema applied'))
    .catch((err) => console.error('Schema could not be applied:', err.message))
    .finally(() => {
        startExpirySweep();
        httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    });
