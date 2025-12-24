const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

// Helper to generate random suffix for unique emails
const rand = Math.floor(Math.random() * 10000);
const artistEmail = `artist_test_${rand}@example.com`;
const listenerEmail = `listener_test_${rand}@example.com`;
const password = 'password123';

let artistToken, listenerToken, artistId, listenerId, bookingId;

const log = (msg, data) => {
  console.log(`\n🔹 ${msg}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const request = async (endpoint, method, token, body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  
  if (!res.ok) {
    console.error(`❌ Error ${res.status} on ${endpoint}:`);
    console.error(JSON.stringify(data, null, 2));
    throw new Error(`Request failed: ${data.message || 'Unknown error'}`);
  }
  return data;
};

const runTest = async () => {
  try {
    console.log('🚀 Starting Booking System Test Flow...');

    // 1. Signup/Login Artist
    log('Registering Artist...');
    const artistAuth = await request('/auth/signup', 'POST', null, {
      email: artistEmail,
      password,
      fullName: 'Artist Test',
      userType: 'artist'
    });
    artistToken = artistAuth.session.access_token;
    artistId = artistAuth.user.id; // Assuming response structure has user.id or we need session
    if (!artistId) {
        // Fetch profile if id not in auth response (it usually is or in 'user' object)
        const me = await request('/auth/me', 'GET', artistToken);
        artistId = me.user.id || me.user._id;
    }
    log('✅ Artist ready:', { id: artistId, email: artistEmail });

    // 2. Signup/Login Listener
    log('Registering Listener...');
    const listenerAuth = await request('/auth/signup', 'POST', null, {
      email: listenerEmail,
      password,
      fullName: 'Listener Test',
      userType: 'listener'
    });
    listenerToken = listenerAuth.session.access_token;
    listenerId = listenerAuth.user.id;
    if (!listenerId) {
         const me = await request('/auth/me', 'GET', listenerToken);
         listenerId = me.user.id || me.user._id;
    }
    log('✅ Listener ready:', { id: listenerId, email: listenerEmail });

    // 3. Create Booking (Listener)
    log('Listener creating booking...');
    const bookingData = {
      artistId: artistId,
      eventType: 'Wedding',
      eventDate: '2025-12-25',
      eventTime: '18:00',
      duration: 4,
      location: 'Test Location',
      notes: 'Testing booking flow'
    };
    const booking = await request('/bookings', 'POST', listenerToken, bookingData);
    bookingId = booking.id || booking._id;
    log('✅ Booking created:', booking);
    
    if (booking.status !== 'waiting_confirmation') throw new Error('Wrong initial status');

    // 4. Confirm (Artist)
    log('Artist confirming...');
    const artistConfirm = await request(`/bookings/${bookingId}/confirm`, 'PATCH', artistToken, { role: 'artist' });
    log('✅ Artist confirmed. Status:', artistConfirm.status);
    
    if (artistConfirm.status !== 'waiting_confirmation') throw new Error('Status should still wait for listener');

    // 5. Confirm (Listener)
    log('Listener confirming...');
    const listenerConfirm = await request(`/bookings/${bookingId}/confirm`, 'PATCH', listenerToken, { role: 'listener' });
    log('✅ Listener confirmed. Status:', listenerConfirm.status);

    if (listenerConfirm.status !== 'waiting_payment') throw new Error('Status should be waiting_payment');

    // 6. Pay (Listener)
    log('Listener paying...');
    const payment = await request(`/bookings/${bookingId}/pay`, 'PATCH', listenerToken);
    log('✅ Payment done. Status:', payment.status);

    if (payment.status !== 'waiting_final_confirmation') throw new Error('Status should be waiting_final_confirmation');

    // 7. Final Confirm (Artist)
    log('Artist final confirm...');
    const artistFinal = await request(`/bookings/${bookingId}/final-confirm`, 'PATCH', artistToken, { role: 'artist' });
    log('✅ Artist finalized. Status:', artistFinal.status);

    // 8. Final Confirm (Listener)
    log('Listener final confirm...');
    const listenerFinal = await request(`/bookings/${bookingId}/final-confirm`, 'PATCH', listenerToken, { role: 'listener' });
    log('✅ Listener finalized. Status:', listenerFinal.status);

    if (listenerFinal.status !== 'completed') throw new Error('Status should be completed');

    console.log('\n✨ SUCCESS! Full Booking Flow Verified!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
};

runTest();
