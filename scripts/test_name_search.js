import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_MAP_API_KEY; 

async function searchByName(name) {
  // Strategy: Search for "Seongnam + Name" to narrow it down
  const query = `성남 ${name.replace(/\(.*\)/, '').trim()}`; // Remove (주), (사) etc for cleaner search
  const cleanName = name.replace(/\(.*\)/, '').trim();

  console.log(`\n🔍 Searching for: "${cleanName}" (Query: "${query}")`);
  
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
        const top = data.documents[0];
        console.log(`   ✅ Found: ${top.place_name}`);
        console.log(`      Address: ${top.road_address_name || top.address_name}`);
        console.log(`      Location: ${top.y}, ${top.x}`);
        return true;
    } else {
        // Retry just name without Seongnam
        console.log(`   🔸 Retrying with just name: "${cleanName}"`);
        const res2 = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(cleanName)}`, {
            headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
        });
        const data2 = await res2.json();
        if (data2.documents && data2.documents.length > 0) {
             const top = data2.documents[0];
             // Filter if address contains Seongnam
             if (top.address_name.includes('성남') || top.road_address_name.includes('성남')) {
                 console.log(`   ✅ Found (Clean Name): ${top.place_name}`);
                 console.log(`      Address: ${top.road_address_name || top.address_name}`);
                 return true;
             } else {
                 console.log(`   ⚠️ Found but not in Seongnam: ${top.address_name}`);
             }
        }
        console.log(`   ❌ Failed.`);
        return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function testRescue() {
  const samples = [
      "(주)  엑셀라이트코리아", // Optician related?
      "(사)틴하모니",
      "(주)  아라테크놀러지",
      "(주) 와이제이 종합건설산업",
      "(주)  이푸른환경"
  ];

  console.log(`Testing Name-Based Rescue on ${samples.length} items...`);
  
  let success = 0;
  for (const name of samples) {
      if (await searchByName(name)) success++;
  }
  
  console.log(`\nResult: ${success}/${samples.length} found.`);
}

testRescue();
