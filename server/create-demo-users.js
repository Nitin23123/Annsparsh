const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    console.log('🌱 Seeding Demo Users...');
    const password = await bcrypt.hash('password123', 10);

    // 1. Create Demo Donor
    const donor = await prisma.user.upsert({
        where: { email: 'demo-donor@test.com' },
        update: {},
        create: {
            email: 'demo-donor@test.com',
            name: 'Demo Donor',
            password: password,
            role: 'DONOR',
            address: '123 Donor St, Food City',
            phone: '9876543210',
        },
    });
    console.log('✅ Created/Found Donor:', donor.email);

    // 2. Create Demo NGO
    const ngo = await prisma.user.upsert({
        where: { email: 'demo-ngo@test.com' },
        update: {},
        create: {
            email: 'demo-ngo@test.com',
            name: 'Demo NGO Foundation',
            password: password,
            role: 'NGO',
            address: '456 Charity Ln, Help Town',
            phone: '1122334455',
        },
    });
    console.log('✅ Created/Found NGO:', ngo.email);

    console.log('\n🎉 Demo Users Ready!');
    console.log('------------------------------------------------');
    console.log('👤 Donor Login: demo-donor@test.com / password123');
    console.log('🏢 NGO Login:   demo-ngo@test.com   / password123');
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
