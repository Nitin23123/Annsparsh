const pool = require('../config/db');

// best_before is stored as a whole number of hours from created_at.
const EXPIRE_SQL = `
    UPDATE donations
    SET status = 'EXPIRED'
    WHERE status = 'AVAILABLE'
      AND created_at + (best_before * INTERVAL '1 hour') < NOW()
    RETURNING id`;

// Sweeps AVAILABLE donations past their freshness window into EXPIRED.
// Called on read so a stale listing can never be claimed, and on a timer so
// the feed clears itself even when nobody is looking.
async function expireStaleDonations() {
    const { rows } = await pool.query(EXPIRE_SQL);
    return rows.length;
}

module.exports = { expireStaleDonations };
