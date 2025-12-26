const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';
const rand = Math.floor(Math.random() * 10000);

const runTest = async () => {
    try {
        console.log('📸 Testing Cloudinary Signature (GET /api/profile/cloudinary-signature)...');

        // 1. Signup User
        const userRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `sig_user_${rand}@test.com`, password: 'password', fullName: 'Sig User', userType: 'listener' })
        });
        const userAuth = await userRes.json();
        const token = userAuth.session.access_token;
        console.log('✅ User Created');

        // 2. Fetch Signature
        const sigRes = await fetch(`${API_URL}/profile/cloudinary-signature`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const sigData = await sigRes.json();
        console.log('Response Status:', sigRes.status);
        console.log('Response Body Keys:', Object.keys(sigData));

        const requiredFields = ['signature', 'timestamp', 'cloud_name', 'api_key', 'folder'];
        const allPresent = requiredFields.every(f => sigData[f]);

        if (sigRes.status === 200 && allPresent) {
            console.log('✨ SUCCESS: Cloudinary signature generated correctly!');
            console.log('Timestamp:', sigData.timestamp);
            console.log('Folder:', sigData.folder);
        } else {
            console.log('❌ FAILURE: Signature incomplete or error occurred.', sigData);
        }

    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
};

runTest();
