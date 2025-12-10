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

async function retryGeocoding() {
    console.log('📂 Reading seeds.json...');
    const rawData = fs.readFileSync(SEEDS_FILE, 'utf-8');
    let data = JSON.parse(rawData);

    // Filter failures (create a list of indices to update in place)
    // We need to update the original 'data' array, so we'll store indices.
    const failedIndices = data.map((item, idx) => item.status === 'geocode_failed' ? idx : -1).filter(idx => idx !== -1);

    console.log(`🚀 Starting Retry for ${failedIndices.length} items...`);
    console.log(`ℹ️ Strategy: Prepend "경기도 성남시 "`);
    console.log(`🛑 Safety: Will STOP if 0 successes in first 100 attempts.`);

    let successCount = 0;
    let processedCount = 0;
    let modifiedCount = 0;

    for (const dataIndex of failedIndices) {
        const item = data[dataIndex];
        processedCount++;

        // Strategy: Prepend '경기도 성남시' to the existing address
        // Also cleanup: remove existing '경기', '성남' if vaguely present to avoid duplication, though API usually handles it.
        // Simple approach: Just prepend "경기도 성남시 " if not present.
        
        let newAddr = item.address;
        if (!newAddr.includes('성남') && !newAddr.includes('경기')) {
             newAddr = `경기도 성남시 ${item.address}`;
        } else if (newAddr.includes('성남') && !newAddr.includes('경기')) {
             newAddr = `경기도 ${newAddr}`;
        }
        
        // Also handle the case where address is just a zip code or weird string (from analysis)
        // If it looks like a category (no numbers, short), maybe skip? 
        // User said "try fixing patterns". Let's run the geocoder.
        
        const coords = await geocodeAddress(newAddr);

        if (coords) {
            data[dataIndex].lat = coords.lat;
            data[dataIndex].lng = coords.lng;
            data[dataIndex].address = coords.road_address; // Update to canonical address
            data[dataIndex].status = 'normal'; // Mark as fixed
            successCount++;
            modifiedCount++;
            process.stdout.write(`\r✅ Fixed: ${successCount}/${processedCount} (Total Failures: ${failedIndices.length})`);
        } else {
            process.stdout.write(`\r⏳ Processing: ${successCount}/${processedCount} (Total Failures: ${failedIndices.length})`);
        }

        // SAFETY CHECK
        if (processedCount === 100) {
            if (successCount === 0) {
                console.error(`\n\n🛑 ABORTING: Tried 100 items but 0 succeeded. The strategy is not working.`);
                process.exit(1); 
            } else {
                console.log(`\n✨ First 100 items check passed. Success rate: ${successCount}%. Continuing...`);
            }
        }

        await delay(20);
    }

    console.log(`\n🎉 Retry Complete! Fixed ${modifiedCount} items.`);
    fs.writeFileSync(SEEDS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Saved updates to seeds.json`);
}

retryGeocoding();
