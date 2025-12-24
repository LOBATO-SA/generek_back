const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

const runTest = async () => {
  try {
    console.log('🔍 Testing GET /api/artists...');

    // 1. List All
    console.log('\n--- Request: GET /api/artists ---');
    const res = await fetch(`${API_URL}/artists`);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${JSON.stringify(data)}`);
    }

    console.log(`✅ Status: ${res.status}`);
    console.log(`📊 Total Artists: ${data.total}`);
    console.log('📋 Artists List (First 3):');
    if (data.artists && data.artists.length > 0) {
        data.artists.slice(0, 3).forEach(a => {
            console.log(`   - [${a.id}] ${a.name} | ${a.genre} | ${a.location}`);
        });
    } else {
        console.log('   (No artists found)');
    }

    // 2. Test Search (if artists exist)
    if (data.total > 0) {
        const firstArtist = data.artists[0];
        const searchName = firstArtist.name.split(' ')[0];
        
        console.log(`\n--- Request: GET /api/artists?search=${searchName} ---`);
        const searchRes = await fetch(`${API_URL}/artists?search=${searchName}`);
        const searchData = await searchRes.json();
        
        console.log(`✅ Status: ${searchRes.status}`);
        console.log(`📊 Found: ${searchData.total}`);
        searchData.artists.forEach(a => {
             console.log(`   - ${a.name}`);
        });
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

runTest();
