import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_MAP_API_KEY; 

async function search(query) {
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    const data = await response.json();
    return data.documents && data.documents.length > 0 ? data.documents[0] : null;
  } catch (e) {
    return null;
  }
}

async function testVariations() {
  const zips = ["13488", "13436"];
  
  for (const zip of zips) {
      console.log(`\n--- Testing Zip: ${zip} ---`);
      
      const strategies = [
          zip,
          `성남 ${zip}`,
          `경기 ${zip}`,
          `우편번호 ${zip}`,
          `성남시 ${zip}`
      ];

      for (const q of strategies) {
          const result = await search(q);
          if (result) {
              console.log(`✅ Success with query "${q}":`);
              console.log(`   -> ${result.place_name}, ${result.road_address_name} (${result.y}, ${result.x})`);
              break; // Found one!
          } else {
              console.log(`❌ Failed with query "${q}"`);
          }
      }
  }
}

testVariations();
