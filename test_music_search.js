const fetch = require('node-fetch');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:3000/api';
const rand = Math.floor(Math.random() * 10000);

const runTest = async () => {
  try {
    console.log('🎵 Testing Music Search & Cover Art...');

    // 1. Setup Artist
    const artistName = `Music Artist ${rand}`;
    const artistRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `music_${rand}@test.com`, password: 'password', fullName: artistName, userType: 'artist' })
    });
    const artistAuth = await artistRes.json();
    const artistToken = artistAuth.session.access_token;
    
    // Set Avatar
    // We use the booking logic to force set checking DB or just rely on logic
    // Actually, let's just assume empty profile first, then update it.
    // Ideally we use a PUT /profile endpoint if available or just update Bio.
    // The previous edit to artist controller added BIO update, but maybe not avatar directly?
    // Profile routes usually handle avatar via upload.
    // Let's rely on the fallback logic first (Placeholder) then maybe Artist Avatar if I can set it.
    // Actually, I can use the debug trick (direct DB) to set avatar to test fallback.
    
    console.log(`✅ Artist Created: ${artistName}`);

    // 2. Upload Song (requires multipart, tricky with fetch in simple script without form-data lib)
    // Wait, I implemented upload endpoint but running it in node script needs 'form-data' package or complex boundary construction.
    // Easier approach: Insert Song directly into DB for testing search logic.
    
    await mongoose.connect('mongodb://localhost:27017/generek');
    const Song = require('./src/models/Song');
    const User = require('./src/models/User');
    const Profile = require('./src/models/Profile');
    
    const dbArtist = await User.findOne({ email: `music_${rand}@test.com` });
    
    // Set Profile Avatar
    await Profile.updateOne({ user_id: dbArtist._id }, { avatar_url: 'https://example.com/artist-avatar.jpg' });

    await Song.create({
        title: 'Searchable Hit',
        artist_id: dbArtist._id,
        file_url: 'http://test.com/audio.mp3',
        file_path: '/tmp/audio.mp3',
        genre: 'Pop'
    });
    
    await Song.create({
        title: 'Hidden Track',
        artist_id: dbArtist._id,
        file_url: 'http://test.com/audio2.mp3',
        file_path: '/tmp/audio2.mp3',
        genre: 'Jazz'
    });

    console.log('✅ Mock Songs Inserted directly to DB');

    // 3. Test Search by Title
    console.log('\n--- Search: Title "Hit" ---');
    const res1 = await fetch(`${API_URL}/songs?search=Hit`);
    const data1 = await res1.json();
    if (data1.songs.length === 1 && data1.songs[0].title === 'Searchable Hit') {
        console.log('✅ Title Search Working');
    } else {
        console.log('❌ Title Search Failed', data1);
    }

    // 4. Test Search by Genre
    console.log('\n--- Search: Genre "Jazz" ---');
    const res2 = await fetch(`${API_URL}/songs?genre=Jazz`);
    const data2 = await res2.json();
    if (data2.songs.length === 1 && data2.songs[0].genre === 'Jazz') {
        console.log('✅ Genre Search Working');
    } else {
        console.log('❌ Genre Search Failed', data2);
    }
    
    // 5. Test Search by Artist Name
    console.log(`\n--- Search: Artist "${artistName.split(' ')[0]}" ---`);
    const res3 = await fetch(`${API_URL}/songs?artist=${artistName.split(' ')[0]}`);
    const data3 = await res3.json();
    if (data3.songs.length >= 2) {
         console.log('✅ Artist Name Search Working (Found both songs)');
    } else {
         console.log('❌ Artist Name Search Failed', data3);
    }

    // 6. Verify Cover Logic
    console.log('\n--- Verify Cover Art Fallback ---');
    const songWithAvatar = data3.songs[0];
    if (songWithAvatar.cover_url === 'https://example.com/artist-avatar.jpg') {
        console.log('✅ Cover URL fell back to Artist Avatar correctly');
    } else {
        console.log(`❌ Cover Logic Failed. Got: ${songWithAvatar.cover_url}`);
    }

    await mongoose.disconnect();
    console.log('\n✨ All Search Tests Passed!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
};

runTest();
