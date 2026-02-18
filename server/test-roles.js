const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const API_URL = 'http://localhost:5000/api';

async function testRoles() {
    try {
        // 1. Ensure NGO exists
        const password = await bcrypt.hash('password123', 10);
        await prisma.user.upsert({
            where: { email: 'ngo@test.com' },
            update: {},
            create: {
                email: 'ngo@test.com',
                name: 'Test NGO',
                password: password,
                role: 'NGO',
                address: 'NGO HQ',
                phone: '9876543210',
            },
        });

        // 2. Get the donation ID (from previous test)
        const donation = await prisma.donation.findFirst({
            where: { status: 'AVAILABLE' }
        });

        if (!donation) {
            console.log('No available donation found to test.');
            return;
        }
        console.log('Testing with Donation ID:', donation.id);

        // 3. Login as DONOR
        console.log('\n--- Testing with DONOR ---');
        try {
            const donorLogin = await axios.post(`${API_URL}/auth/login`, {
                email: 'donor@test.com',
                password: 'password123'
            });
            const donorToken = donorLogin.data.token;

            await axios.post(`${API_URL}/requests`, { donationId: donation.id }, {
                headers: { Authorization: `Bearer ${donorToken}` }
            });
            console.error('❌ DONOR was able to request food! (Should have failed)');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ DONOR request correctly blocked (403 Forbidden).');
            } else {
                console.error('Unexpected error for DONOR:', error.message);
            }
        }

        // 4. Login as NGO
        console.log('\n--- Testing with NGO ---');
        try {
            const ngoLogin = await axios.post(`${API_URL}/auth/login`, {
                email: 'ngo@test.com',
                password: 'password123'
            });
            const ngoToken = ngoLogin.data.token;

            const res = await axios.post(`${API_URL}/requests`, { donationId: donation.id }, {
                headers: { Authorization: `Bearer ${ngoToken}` }
            });
            console.log('✅ NGO request successful!', res.data);
        } catch (error) {
            console.error('❌ NGO request failed:', error.response ? error.response.data : error.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testRoles();
