const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

const rand = Math.floor(Math.random() * 10000);
const artistEmail = `booking_list_artist_${rand}@example.com`;
const listenerEmail = `booking_list_listener_${rand}@example.com`;
const password = 'password123';

let artistToken, listenerToken, artistId, listenerId;

const request = async (endpoint, method, token, body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(`Error ${res.status} on ${endpoint}: ${JSON.stringify(data)}`);
  }
  return data;
};

const runTest = async () => {
  try {
    console.log('🚀 Testing GET /api/bookings...');

    // 1. Setup Users
    console.log('\n--- Setup ---');
    const artistAuth = await request('/auth/signup', 'POST', null, {
      email: artistEmail,
      password,
      fullName: 'Booking List Artist',
      userType: 'artist'
    });
    artistToken = artistAuth.session.access_token;
    artistId = artistAuth.user.id;
    console.log(`✅ Artist Created: ${artistEmail}`);

    const listenerAuth = await request('/auth/signup', 'POST', null, {
      email: listenerEmail,
      password,
      fullName: 'Booking List Listener',
      userType: 'listener'
    });
    listenerToken = listenerAuth.session.access_token;
    listenerId = listenerAuth.user.id;
    console.log(`✅ Listener Created: ${listenerEmail}`);

    // 2. Create Bookings
    console.log('\n--- Creating Bookings ---');
    await request('/bookings', 'POST', listenerToken, {
      artist_id: artistId,
      event_type: 'Wedding',
      event_date: '2025-12-25',
      event_time: '18:00',
      duration_hours: 4,
      location: 'Hall A',
      notes: 'Booking 1'
    });
    console.log('✅ Booking 1 created');

    await request('/bookings', 'POST', listenerToken, {
      artist_id: artistId,
      event_type: 'Birthday',
      event_date: '2026-01-01',
      event_time: '20:00',
      duration_hours: 3,
      location: 'Hall B',
      notes: 'Booking 2'
    });
    console.log('✅ Booking 2 created');

    // 3. List as Listener
    console.log('\n--- Request: GET /api/bookings (As Listener) ---');
    const listenerList = await request('/bookings', 'GET', listenerToken);
    console.log(`✅ Status: 200`);
    console.log(`📊 Total Bookings: ${listenerList.length}`);
    listenerList.forEach(b => console.log(`   - [${b.status}] ${b.eventType} @ ${b.location}`));

    if (listenerList.length !== 2) throw new Error('Listener should see 2 bookings');

    // 4. List as Artist
    console.log('\n--- Request: GET /api/bookings (As Artist) ---');
    const artistList = await request('/bookings', 'GET', artistToken);
    console.log(`✅ Status: 200`);
    console.log(`📊 Total Bookings: ${artistList.length}`);
    artistList.forEach(b => console.log(`   - [${b.status}] ${b.eventType} @ ${b.location}`));

    if (artistList.length !== 2) throw new Error('Artist should see 2 bookings');

    // 5. Filter Test
    console.log('\n--- Request: GET /api/bookings?status=waiting_confirmation ---');
    const filteredList = await request('/bookings?status=waiting_confirmation', 'GET', listenerToken);
    console.log(`📊 Filtered Count: ${filteredList.length}`);
    if (filteredList.length !== 2) throw new Error('Filter should return 2 waiting bookings');

    console.log('\n✨ SUCCESS! Booking Listing Verified!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

runTest();
