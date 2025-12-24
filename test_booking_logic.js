const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';
const rand = Math.floor(Math.random() * 10000);

const runTest = async () => {
  try {
    console.log('🚀 Testing Booking Logic Enhancements...');

    // 1. Setup Artist with Price
    const artistEmail = `price_artist_${rand}@example.com`;
    const artistRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: artistEmail, password: 'password', fullName: 'Price Artist', userType: 'artist' })
    });
    const artistAuth = await artistRes.json();
    const artistToken = artistAuth.session.access_token;
    const artistId = artistAuth.user.id;
    console.log(`✅ Artist Created. ID: ${artistId}`);

    // Set hourly rate to 5000
    await fetch(`${API_URL}/artists/bio`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${artistToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ minPrice: 5000, about: 'Expensive artist' })
    });
    console.log('✅ Artist Price set to 5000');

    // 2. Setup Listener
    const listenerRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `price_listener_${rand}@example.com`, password: 'password', fullName: 'Price Listener', userType: 'listener' })
    });
    const listenerAuth = await listenerRes.json();
    const listenerToken = listenerAuth.session.access_token;
    console.log('✅ Listener Created');

    // 3. Create Booking (5 hours)
    console.log('\n--- Creating Booking (5 hours) ---');
    const bookingRes = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${listenerToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            artist_id: artistId,
            event_type: 'Gala',
            event_date: '2025-12-31',
            event_time: '20:00',
            duration_hours: 5,
            location: 'Grand Hall',
            notes: 'Test Calculation'
        })
    });
    const bookingData = await bookingRes.json();
    
    // Check Price
    const expectedPrice = 5000 * 5;
    if (bookingData.total_price === expectedPrice) {
        console.log(`✅ Price Calculation Correct: ${bookingData.total_price} (5000 * 5)`);
    } else {
        throw new Error(`Price Mismatch! Expected ${expectedPrice}, got ${bookingData.total_price}`);
    }

    // 4. Check List for Avatar
    console.log('\n--- Checking Booking List for Avatar ---');
    const listRes = await fetch(`${API_URL}/bookings`, {
        headers: { 'Authorization': `Bearer ${listenerToken}` }
    });
    const listData = await listRes.json();
    const myBooking = listData.find(b => b._id === bookingData.booking_id || b.id === bookingData.booking_id);

    if (myBooking && myBooking.artistId && myBooking.artistId.avatar_url !== undefined) {
        console.log(`✅ Artist Avatar Field Present: ${myBooking.artistId.avatar_url}`);
    } else {
        console.log('❌ Avatar Missing in Response:', JSON.stringify(myBooking, null, 2));
        throw new Error('Avatar URL missing in booking list');
    }

    console.log('\n✨ All Logic Verified!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

runTest();
