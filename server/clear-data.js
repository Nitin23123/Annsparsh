const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
    try {
        console.log('Clearing Requests...');
        await prisma.request.deleteMany({});
        console.log('Requests cleared.');

        console.log('Clearing Donations...');
        await prisma.donation.deleteMany({});
        console.log('Donations cleared.');

        console.log('Database reset successfully! Users are preserved.');
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();
