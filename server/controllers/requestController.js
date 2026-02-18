const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NGO requests a donation
const createRequest = async (req, res) => {
    const { donationId, message } = req.body;
    const ngoId = req.user.userId;

    try {
        // Check if donation exists and is available
        const donation = await prisma.donation.findUnique({ where: { id: parseInt(donationId) } });
        if (!donation || donation.status !== 'AVAILABLE') {
            return res.status(400).json({ message: 'Donation not available' });
        }

        // Check if already requested by this NGO
        const existingRequest = await prisma.request.findFirst({
            where: {
                donationId: parseInt(donationId),
                ngoId
            }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        const request = await prisma.request.create({
            data: {
                donationId: parseInt(donationId),
                ngoId,
                message,
                status: 'PENDING'
            },
            include: {
                donation: true,
                ngo: { select: { name: true } }
            }
        });

        // Notify Donor 
        // In a real app, we might emit to a specific room "user_<donorId>", but broadcasting is fine for now
        req.io.emit('request:created', request);

        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Error creating request' });
    }
};

// Donor sees requests for their donations
const getRequestsForDonor = async (req, res) => {
    const donorId = req.user.userId;

    try {
        const requests = await prisma.request.findMany({
            where: {
                donation: {
                    donorId: donorId
                }
            },
            include: {
                donation: true,
                ngo: {
                    select: { name: true, email: true, phone: true, address: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
}

// NGO sees their own requests
const getRequestsForNgo = async (req, res) => {
    const ngoId = req.user.userId;

    try {
        const requests = await prisma.request.findMany({
            where: { ngoId },
            include: {
                donation: {
                    include: {
                        donor: { select: { name: true, phone: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching NGO requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
}

// Donor approves/rejects OR NGO adds volunteer info
const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status, volunteerName, volunteerPhone, vehicleNumber } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        const request = await prisma.request.findUnique({
            where: { id: parseInt(id) },
            include: { donation: true }
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const updateData = {};

        // Scenario 1: Donor updates Status
        if (userRole === 'DONOR') {
            if (request.donation.donorId !== userId) {
                return res.status(403).json({ message: 'Unauthorized: You are not the donor of this item' });
            }
            if (status) {
                if (!['APPROVED', 'REJECTED'].includes(status)) {
                    return res.status(400).json({ message: 'Invalid status' });
                }
                updateData.status = status;
            }
        }
        // Scenario 2: NGO updates Volunteer Info
        else if (userRole === 'NGO') {
            if (request.ngoId !== userId) {
                return res.status(403).json({ message: 'Unauthorized: This is not your request' });
            }
            // NGO can only update if approved (optional check, but good for workflow)
            // if (request.status !== 'APPROVED') { ... } 

            if (volunteerName) updateData.volunteerName = volunteerName;
            if (volunteerPhone) updateData.volunteerPhone = volunteerPhone;
            if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
        }
        else if (userRole === 'ADMIN') {
            // Admin can do anything
            if (status) updateData.status = status;
            if (volunteerName) updateData.volunteerName = volunteerName;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid updates provided for your role' });
        }

        const updatedRequest = await prisma.request.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                donation: {
                    include: {
                        donor: { select: { name: true, phone: true } }
                    }
                },
                ngo: { select: { name: true, email: true, phone: true, address: true } }
            }
        });

        // Trigger side effects if status changed to APPROVED
        if (updateData.status === 'APPROVED') {
            await prisma.donation.update({
                where: { id: request.donationId },
                data: { status: 'CLAIMED' }
            });

            await prisma.request.updateMany({
                where: {
                    donationId: request.donationId,
                    id: { not: parseInt(id) },
                    status: 'PENDING'
                },
                data: { status: 'REJECTED' }
            });
        }

        req.io.emit('request:updated', updatedRequest);

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Error updating request' });
    }
}

module.exports = { createRequest, getRequestsForDonor, getRequestsForNgo, updateRequestStatus };
