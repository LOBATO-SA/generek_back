const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';
const rand = Math.floor(Math.random() * 10000);

const runTest = async () => {
    try {
        console.log('🎵 Testing Music Registration (POST /api/songs/register)...');

        // 1. Signup Artist
        const artistRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `reg_artist_${rand}@test.com`, password: 'password', fullName: 'Reg Artist', userType: 'artist' })
        });
        const artistAuth = await artistRes.json();
        const artistToken = artistAuth.session.access_token;
        console.log('✅ Artist Created');

        // 2. Register Song
        const regRes = await fetch(`${API_URL}/songs/register`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${artistToken}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                title: 'My Direct Upload',
                genre: 'Rock',
                file_url: 'https://bytescale.com/test-audio.mp3',
                file_path: '/uploads/test-audio.mp3',
                duration: 180
            })
        });

        const regData = await regRes.json();
        console.log('Response Status:', regRes.status);
        console.log('Response Body:', JSON.stringify(regData, null, 2));

        if (regRes.status === 201 && regData.song.title === 'My Direct Upload') {
            console.log('✨ SUCCESS: Song registered correctly!');
        } else {
            console.log('❌ FAILURE: Registration failed.');
        }

    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
};

runTest();
