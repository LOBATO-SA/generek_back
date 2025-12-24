const fetch = require('node-fetch');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:3000/api';
const rand = Math.floor(Math.random() * 100000);

// We need to access DB directly to force sets sometimes if API doesn't support it easily, 
// but here we can use the Profile update endpoint or DB directly.
// Let's use DB directly for setup to be 100% sure data is there.

// Connection string from .env (standard local)
const MONGO_URI = 'mongodb://localhost:27017/generek';
const Profile = require('./src/models/Profile');

const runDebug = async () => {
    try {
        console.log('🐞 Debugging Avatar URL...');
        
        // 1. Signup Artist
        const artistRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `avatar_debug_${rand}@test.com`, password: 'password', fullName: 'Avatar Debug', userType: 'artist' })
        });
        const artistAuth = await artistRes.json();
        const artistId = artistAuth.user.id;
        const artistToken = artistAuth.session.access_token;
        console.log(`✅ Artist Created: ${artistId}`);

        // 2. Set Avatar URL directly in DB to ensures it exists
        // Connect DB
        await mongoose.connect(MONGO_URI);
        const forcedUrl = "https://example.com/my-avatar.jpg";
        await Profile.findOneAndUpdate(
            { user_id: artistId }, 
            { avatar_url: forcedUrl }
        );
        console.log(`✅ Forced Avatar URL in DB: ${forcedUrl}`);
        
        // 3. Signup Listener
        const listenerRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `listener_debug_${rand}@test.com`, password: 'password', fullName: 'Listener Debug', userType: 'listener' })
        });
        const listenerAuth = await listenerRes.json();
        const listenerToken = listenerAuth.session.access_token;

        // 4. Create Booking
        await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${listenerToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                artist_id: artistId,
                event_type: 'Test',
                event_date: '2025-01-01',
                event_time: '12:00',
                duration_hours: 2,
                location: 'Lab'
            })
        });
        console.log('✅ Booking Created');

        // 5. Fetch Bookings e check Avatar
        const listRes = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${listenerToken}` }
        });
        const list = await listRes.json();
        
        const myBooking = list[0];
        
        console.log('🔍 Inspecting Response (Root & Artist):');
        console.log('Root keys:', Object.keys(myBooking));
        console.log('Artist Avatar Root:', myBooking.artist_avatar);
        console.log('Artist Object:', JSON.stringify(myBooking.artistId, null, 2));

        if (myBooking.artistId && myBooking.artistId.avatar_url === forcedUrl) {
            console.log('✨ SUCCESS: Avatar URL found!');
        } else {
            console.log('❌ FAILURE: Avatar URL mismatch or missing.');
        }
        
        await mongoose.disconnect();

    } catch (e) {
        console.error(e);
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
};

runDebug();
