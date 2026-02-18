const express = require('express');
const router = express.Router();
const { createDonation, getDonations, getDonationById, deleteDonation, getMyDonations } = require('../controllers/donationController');
const { authenticateToken } = require('../middleware/auth');

// Create a new donation (Protected)
router.post('/', authenticateToken, createDonation);

// Get all available donations (Public or Protected? Let's keep it public for now, or protected for NGOs)
// For now, let's allow anyone to see, but maybe filter in frontend
router.get('/', getDonations);

// Get a single donation by ID
router.get('/my', authenticateToken, getMyDonations);
router.get('/:id', getDonationById);

// Delete a donation (Protected, only creator can delete)
router.delete('/:id', authenticateToken, deleteDonation);

module.exports = router;
