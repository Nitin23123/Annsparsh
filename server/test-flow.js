const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testFlow() {
    try {
        console.log('1. Logging in as Donor...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'donor@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login Successful. Token received.');

        console.log('2. Creating a new Donation...');
        const donationData = {
            foodItem: 'Test Pasta from Script',
            foodType: 'cooked',
            quantity: '20 servings',
            expiryTime: new Date(Date.now() + 3600000).toISOString(),
            pickupAddress: 'Script Address',
            description: 'Created via test script'
        };

        const createRes = await axios.post(`${API_URL}/donations`, donationData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Donation Created:', createRes.data.foodItem);

        console.log('3. Verifying visibility (Getting All Donations)...');
        const getRes = await axios.get(`${API_URL}/donations`);
        const donations = getRes.data;

        const found = donations.find(d => d.foodItem === 'Test Pasta from Script');

        if (found) {
            console.log('✅ SUCCESS: New donation is visible in the list!');
            console.log('Details:', found);
        } else {
            console.error('❌ FAILURE: New donation NOT found in the list.');
            console.log('List:', donations);
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testFlow();
