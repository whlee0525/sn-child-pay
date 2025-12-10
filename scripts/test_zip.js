import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_MAP_API_KEY; 

async function testZipCode() {
  const zip = "13488";
  console.log(`Testing Zip Code: ${zip}`);
  
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${zip}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testZipCode();
