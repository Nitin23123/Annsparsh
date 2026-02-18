const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    // 1. Create a Test Donor
    const password = await bcrypt.hash('password123', 10);
    const donor = await prisma.user.upsert({
        where: { email: 'donor@test.com' },
        update: {},
        create: {
            email: 'donor@test.com',
            name: 'Test Donor',
            password: password,
            role: 'DONOR',
            address: '123 Test St',
            phone: '1234567890',
        },
    });

    console.log('✅ Created User:', donor.name);

    // 2. Create a Donation
    const donation = await prisma.donation.create({
        data: {
            foodItem: 'Test Rice & Curry',
            foodType: 'Veg',
            quantity: '10 kg',
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            pickupAddress: '123 Test St',
            description: 'Freshly made food for testing.',
            donorId: donor.id,
            status: 'AVAILABLE',
        },
    });

    console.log('✅ Created Donation:', donation.foodItem);
    console.log('🚀 Verification Successful! Database is working.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
