const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text();
    }
    return { status: res.status, ok: res.ok, data };
}

let adminToken = '';
let donorToken = '';
let ngoToken = '';
let donorUser = null;
let ngoUser = null;

const results = [];
function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark}: ${testName} ${details ? `(${details})` : ''}`);
}

async function runAllTests() {
    console.log('\n==================================================');
    console.log('   ANNSParsh End-to-End System & Security Test    ');
    console.log('==================================================\n');

    // 1. Health check
    try {
        const health = await request('/health');
        record('Health Check endpoint responds', health.status === 200 && health.data.status === 'ok');
    } catch (e) {
        record('Health Check endpoint responds', false, e.message);
    }

    // 2. Auth: Bad credentials
    try {
        const badLogin = await request('/auth/login', {
            method: 'POST',
            body: { email: 'nonexistent@example.com', password: 'wrong' }
        });
        record('Auth rejects invalid credentials with 401', badLogin.status === 401);
    } catch (e) {
        record('Auth rejects invalid credentials with 401', false, e.message);
    }

    // 3. Auth: Login as seeded Admin, Donor, NGO
    try {
        const adminRes = await request('/auth/login', {
            method: 'POST',
            body: { email: 'admin@annsparsh.com', password: 'password' }
        });
        adminToken = adminRes.data?.token;
        record('Admin Login', adminRes.status === 200 && Boolean(adminToken));

        const donorRes = await request('/auth/login', {
            method: 'POST',
            body: { email: 'donor@example.com', password: 'password123' }
        });
        donorToken = donorRes.data?.token;
        donorUser = donorRes.data?.user;
        record('Donor Login', donorRes.status === 200 && Boolean(donorToken));

        const ngoRes = await request('/auth/login', {
            method: 'POST',
            body: { email: 'ngo@example.com', password: 'password123' }
        });
        ngoToken = ngoRes.data?.token;
        ngoUser = ngoRes.data?.user;
        record('NGO Login', ngoRes.status === 200 && Boolean(ngoToken));
    } catch (e) {
        record('Seeded Logins', false, e.message);
    }

    // 4. Security: Gating & RBAC
    try {
        // Unauthenticated request
        const unauth = await request('/donations/available');
        record('Security: Unauthenticated request blocked (401)', unauth.status === 401);

        // Tampered / Invalid token
        const badToken = await request('/donations/available', {
            headers: { Authorization: 'Bearer thisisafaketoken123' }
        });
        record('Security: Invalid token blocked (401)', badToken.status === 401);

        // Role Gating: Donor calls NGO-only endpoint
        const donorCallsNgo = await request('/donations/available', {
            headers: { Authorization: `Bearer ${donorToken}` }
        });
        record('RBAC: Donor cannot access NGO-only feed (403)', donorCallsNgo.status === 403);

        // Role Gating: NGO calls Donor-only creation endpoint
        const ngoCallsDonor = await request('/donations', {
            method: 'POST',
            headers: { Authorization: `Bearer ${ngoToken}` },
            body: { food_type: 'Test', quantity: '10', address: 'Test', best_before: 4 }
        });
        record('RBAC: NGO cannot create donations (403)', ngoCallsDonor.status === 403);

        // Role Gating: Non-admin calls admin endpoints
        const donorCallsAdmin = await request('/admin/stats', {
            headers: { Authorization: `Bearer ${donorToken}` }
        });
        record('RBAC: Donor cannot access Admin stats (403)', donorCallsAdmin.status === 403);

        const ngoCallsAdmin = await request('/admin/stats', {
            headers: { Authorization: `Bearer ${ngoToken}` }
        });
        record('RBAC: NGO cannot access Admin stats (403)', ngoCallsAdmin.status === 403);

        // Admin calls admin endpoints
        const adminStats = await request('/admin/stats', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        record('Admin can fetch platform stats (200)', adminStats.status === 200 && 'total_users' in adminStats.data);
    } catch (e) {
        record('Security & RBAC checks', false, e.message);
    }

    // 5. Input Validation: Creating a donation
    let testDonationId = null;
    try {
        // Missing fields
        const badDonation = await request('/donations', {
            method: 'POST',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: { food_type: 'Biryani' }
        });
        record('Validation: Missing required fields rejected (400)', badDonation.status === 400);

        // Invalid best_before
        const badExpiry = await request('/donations', {
            method: 'POST',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: { food_type: 'Biryani', quantity: '20 plates', address: '123 Main St', best_before: -3 }
        });
        record('Validation: Negative best_before rejected (400)', badExpiry.status === 400);

        // Valid donation creation
        const validDonation = await request('/donations', {
            method: 'POST',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: {
                food_type: 'E2E Test Surplus Biryani',
                quantity: '30 plates',
                address: '77 Innovation Way, Tech Park',
                best_before: 5,
                notes: 'Carefully packaged, keep warm'
            }
        });
        testDonationId = validDonation.data?.id;
        record('Workflow: Donor creates donation (201, status: AVAILABLE)',
            validDonation.status === 201 && validDonation.data?.status === 'AVAILABLE'
        );
    } catch (e) {
        record('Donation creation workflow', false, e.message);
    }

    // 6. NGO browses & requests donation
    let testRequestId = null;
    try {
        // NGO sees available donation
        const available = await request('/donations/available', {
            headers: { Authorization: `Bearer ${ngoToken}` }
        });
        const found = available.data.find(d => d.id === testDonationId);
        record('Workflow: NGO sees available donation in feed', Boolean(found));

        // NGO requests donation
        const reqResult = await request('/requests', {
            method: 'POST',
            headers: { Authorization: `Bearer ${ngoToken}` },
            body: { donation_id: testDonationId }
        });
        testRequestId = reqResult.data?.id;
        record('Workflow: NGO submits request for donation (201, status: PENDING)',
            reqResult.status === 201 && reqResult.data?.status === 'PENDING'
        );

        // Duplicate request prevention
        const dupReq = await request('/requests', {
            method: 'POST',
            headers: { Authorization: `Bearer ${ngoToken}` },
            body: { donation_id: testDonationId }
        });
        record('Security: Duplicate request on same donation prevented (409)', dupReq.status === 409);
    } catch (e) {
        record('NGO request workflow', false, e.message);
    }

    // 7. Donor reviews and approves request
    try {
        const incoming = await request('/requests/incoming', {
            headers: { Authorization: `Bearer ${donorToken}` }
        });
        const reqInList = incoming.data.find(r => r.id === testRequestId);
        record('Workflow: Donor sees incoming request', Boolean(reqInList));

        // Donor approves
        const approveRes = await request(`/requests/${testRequestId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: { action: 'APPROVE' }
        });
        record('Workflow: Donor approves request (status flips to APPROVED & donation CLAIMED)',
            approveRes.status === 200
        );
    } catch (e) {
        record('Donor approval workflow', false, e.message);
    }

    // 8. Volunteer Assignment & OTP Generation
    let generatedOtp = null;
    try {
        // Missing fields rejected
        const badVol = await request(`/requests/${testRequestId}/volunteer`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${ngoToken}` },
            body: { volunteer_name: 'Ramesh' }
        });
        record('Validation: Missing volunteer details rejected (400)', badVol.status === 400);

        // Valid assignment
        const volRes = await request(`/requests/${testRequestId}/volunteer`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${ngoToken}` },
            body: {
                volunteer_name: 'Ramesh Kumar',
                volunteer_phone: '9876543210',
                vehicle_type: 'Delivery Van',
                vehicle_number: 'MH-12-AB-9999'
            }
        });
        generatedOtp = volRes.data?.otp;
        record('Workflow: NGO assigns volunteer & 4-digit OTP is generated',
            volRes.status === 200 && typeof generatedOtp === 'string' && generatedOtp.length === 4
        );
    } catch (e) {
        record('Volunteer assignment & OTP generation', false, e.message);
    }

    // 9. OTP Verification & Handover
    try {
        // Wrong OTP verification
        const wrongOtpRes = await request(`/requests/${testRequestId}/verify-otp`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: { otp: '0000' }
        });
        record('Security: Invalid OTP rejected (400) and attempts tracked',
            wrongOtpRes.status === 400 && 'attempts_remaining' in wrongOtpRes.data
        );

        // Correct OTP verification
        const correctOtpRes = await request(`/requests/${testRequestId}/verify-otp`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: { otp: generatedOtp }
        });
        record('Workflow: Correct OTP marks food as COLLECTED',
            correctOtpRes.status === 200
        );

        // Check donation status
        const myDonations = await request('/donations/mine', {
            headers: { Authorization: `Bearer ${donorToken}` }
        });
        const currentDonation = myDonations.data.find(d => d.id === testDonationId);
        record('Workflow: Donation state verified as COLLECTED in DB',
            currentDonation?.status === 'COLLECTED'
        );

        // Mark as COMPLETED
        const completeRes = await request(`/donations/${testDonationId}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${donorToken}` },
            body: { status: 'COMPLETED' }
        });
        record('Workflow: Donation successfully marked COMPLETED', completeRes.status === 200);
    } catch (e) {
        record('OTP verification workflow', false, e.message);
    }

    // 10. Grievance & Trust Safety Module
    let reportId = null;
    try {
        const reportRes = await request('/reports', {
            method: 'POST',
            headers: { Authorization: `Bearer ${ngoToken}` },
            body: {
                reported_role: 'DONOR',
                category: 'FOOD_QUALITY',
                severity: 'HIGH',
                donation_id: testDonationId,
                description: 'E2E test: Food quality grievance filed by NGO for investigation'
            }
        });
        reportId = reportRes.data?.report?.id;
        const ticket = reportRes.data?.ticket;
        record('Workflow: Grievance report filed with ticket generation (201)',
            reportRes.status === 201 && typeof ticket === 'string' && ticket.startsWith('REP-')
        );

        // Admin views grievances
        const adminReports = await request('/reports', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        record('Admin can view all grievance reports',
            adminReports.status === 200 && Array.isArray(adminReports.data)
        );

        // Admin updates status to INVESTIGATING
        const invRes = await request(`/reports/${reportId}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: { status: 'INVESTIGATING', admin_notes: 'Under review by safety officer' }
        });
        record('Admin updates grievance to INVESTIGATING', invRes.status === 200);

        // Admin updates status to RESOLVED
        const resolveRes = await request(`/reports/${reportId}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: { status: 'RESOLVED', admin_notes: 'Resolved: warning issued to donor' }
        });
        record('Admin resolves grievance report', resolveRes.status === 200);
    } catch (e) {
        record('Grievance & Trust Safety Module', false, e.message);
    }

    // Summary
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log('\n==================================================');
    console.log(`  TEST RESULTS: ${passed}/${total} PASSED (${failed} FAILED)  `);
    console.log('==================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runAllTests().catch(err => {
    console.error('Test suite runner crashed:', err);
    process.exit(1);
});
