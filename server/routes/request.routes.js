const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Create a request (Protected, only NGOs can request?)
// Let's assume for now any authenticated user can request, or restrict to NGO role
router.post('/', authenticateToken, authorizeRole(['NGO', 'ADMIN']), requestController.createRequest);

// Get requests for a donor (Protected, only Donor sees requests for their donations)
router.get('/donor', authenticateToken, authorizeRole(['DONOR', 'ADMIN']), requestController.getRequestsForDonor);

// Get requests for an NGO (Protected, only NGO sees their own requests)
router.get('/ngo', authenticateToken, authorizeRole(['NGO', 'ADMIN']), requestController.getRequestsForNgo);

// Update request status (approve/reject) (Protected, only Donor)
// Update request status (approve/reject) or add details
router.put('/:id', authenticateToken, authorizeRole(['DONOR', 'NGO', 'ADMIN']), requestController.updateRequestStatus);

module.exports = router;
