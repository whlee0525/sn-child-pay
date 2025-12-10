import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_MAP_API_KEY; 
const SEEDS_FILE = path.join(process.cwd(), 'src', 'data', 'seeds.json');

if (!KAKAO_API_KEY) {
  console.error('❌ Error: API Key missing');
  process.exit(1);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address) {
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.documents && data.documents.length > 0) {
      const { x, y } = data.documents[0];
      return { lat: parseFloat(y), lng: parseFloat(x), road_address: data.documents[0].road_address?.address_name || address };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function retryPlausible() {
    console.log('📂 Reading seeds.json...');
    const rawData = fs.readFileSync(SEEDS_FILE, 'utf-8');
    let data = JSON.parse(rawData);

    // Filter logic same as analysis
    const keywords = ['시', '구', '동', '길', '로', '번지', '층', '호'];
    
    // Find indices of plausible failures
    const targetIndices = data.map((item, idx) => {
        if (item.status !== 'geocode_failed') return -1;
        const addr = item.address;
        if (addr.length < 5) return -1;
        if (/^\d+$/.test(addr)) return -1; 
        if (!keywords.some(k => addr.includes(k))) return -1;
        return idx;
    }).filter(idx => idx !== -1);

    console.log(`🚀 Starting Rescue Operation for ${targetIndices.length} items...`);

    let successCount = 0;
    
    for (let i = 0; i < targetIndices.length; i++) {
        const idx = targetIndices[i];
        const item = data[idx];
        
        let newAddr = item.address;
        // Fix Strategy: Prepend city if missing
        if (!newAddr.includes('성남') && !newAddr.includes('경기')) {
             newAddr = `경기도 성남시 ${item.address}`;
        }
        
        // Cleanup parenthesis for better hit rate
        newAddr = newAddr.replace(/\(.*\)/, '').trim();

        const coords = await geocodeAddress(newAddr);

        if (coords) {
            data[idx].lat = coords.lat;
            data[idx].lng = coords.lng;
            data[idx].address = coords.road_address; 
            data[idx].status = 'normal';
            successCount++;
            process.stdout.write(`\r✅ Rescued: ${successCount}/${i + 1} (${item.name})         `);
        } else {
            process.stdout.write(`\r⏳ Processing: ${successCount}/${i + 1}                         `);
        }
        await delay(50); // Be gentle
    }

    console.log(`\n\n🎉 Operation Complete! Saved ${successCount} additional places.`);
    fs.writeFileSync(SEEDS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Updated seeds.json`);
}

retryPlausible();
