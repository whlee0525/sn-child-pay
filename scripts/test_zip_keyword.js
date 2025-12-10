import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_MAP_API_KEY; 

async function testZipKeyword(zip) {
  console.log(`Testing Zip Code (Keyword Search): ${zip}`);
  
  try {
    // Try keyword search instead of address search
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${zip}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
        console.log(`✅ Found ${data.documents.length} results.`);
        console.log(`First Result: [${data.documents[0].place_name}] ${data.documents[0].road_address_name}`);
        console.log(`Coords: ${data.documents[0].y}, ${data.documents[0].x}`);
    } else {
        console.log(`❌ No results found for ${zip}`);
    }
  } catch (e) {
    console.error(e);
  }
}

// Test with the user's example and one of ours
testZipKeyword("13436");
testZipKeyword("13488");
