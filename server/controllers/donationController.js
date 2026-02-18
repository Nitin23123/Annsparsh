const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createDonation = async (req, res) => {
    const { foodItem, foodType, quantity, expiryTime, description, pickupAddress, imageUrl } = req.body;
    const donorId = req.user.userId; // From auth middleware

    if (!foodItem || !quantity || !expiryTime || !pickupAddress) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const newDonation = await prisma.donation.create({
            data: {
                foodItem,
                foodType,
                quantity,
                expiryTime: new Date(expiryTime),
                description,
                pickupAddress,
                imageUrl,
                donorId,
            },
        });

        // Notify everyone about new donation
        req.io.emit('donation:created', newDonation);

        res.status(201).json(newDonation);
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ message: 'Error creating donation' });
    }
};

const getDonations = async (req, res) => {
    try {
        // Optional filters can be added here (e.g., by status, foodType)
        const donations = await prisma.donation.findMany({
            where: {
                status: 'AVAILABLE', // Only show available donations by default
            },
            include: {
                donor: {
                    select: { name: true, phone: true } // Include donor details securely
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Error fetching donations' });
    }
};

const getMyDonations = async (req, res) => {
    const donorId = req.user.userId;
    try {
        const donations = await prisma.donation.findMany({
            where: { donorId },
            include: {
                requests: {
                    include: {
                        ngo: { select: { name: true, phone: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        console.error('Error fetching my donations:', error);
        res.status(500).json({ message: 'Error fetching my donations' });
    }
}

const getDonationById = async (req, res) => {
    const { id } = req.params;
    try {
        const donation = await prisma.donation.findUnique({
            where: { id: parseInt(id) },
            include: {
                donor: { select: { name: true, phone: true, email: true } }
            }
        });

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        res.json(donation);
    } catch (error) {
        console.error('Error fetching donation:', error);
        res.status(500).json({ message: 'Error fetching donation' });
    }
};


const deleteDonation = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const donation = await prisma.donation.findUnique({ where: { id: parseInt(id) } });

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donorId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this donation' });
        }

        await prisma.donation.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ message: 'Error deleting donation' });
    }
}

module.exports = { createDonation, getDonations, getDonationById, deleteDonation, getMyDonations };
