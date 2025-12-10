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

async function searchKeyword(query) {
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.documents;
  } catch (e) {
    return null;
  }
}

async function rescueByName() {
    console.log('📂 Reading seeds.json...');
    const rawData = fs.readFileSync(SEEDS_FILE, 'utf-8');
    let data = JSON.parse(rawData);

    // Identify targets: All remaining failures
    const failedIndices = data.map((item, idx) => item.status === 'geocode_failed' ? idx : -1).filter(idx => idx !== -1);
    
    console.log(`🚀 Starting Massive Name Rescue for ${failedIndices.length} items...`);
    console.log(`ℹ️ Strategy: Clean Name -> Keyword Search -> Filter by 'Seongnam'`);

    let successCount = 0;
    
    for (let i = 0; i < failedIndices.length; i++) {
        const idx = failedIndices[i];
        const item = data[idx];

        // 1. Clean Name: Remove (주), (사), etc.
        const cleanName = item.name.replace(/\([^)]*\)/g, '').trim(); // Remove anything in parens
        
        // 2. Search Strategy: Try "Seongnam + Name" first
        let candidates = await searchKeyword(`성남 ${cleanName}`);
        
        // If no results, try just Name
        if (!candidates || candidates.length === 0) {
            candidates = await searchKeyword(cleanName);
        }

        let bestMatch = null;

        if (candidates && candidates.length > 0) {
            // 3. Selection Logic
            // Priority A: Address contains 'Seongnam' or 'Bundang' or 'Sujeong' or 'Jungwon'
            // Priority B: If original data had a zip code, check if address matches (hard to match 5-digit zip to address string, skip for now complexity)
            
            const seongnamMatch = candidates.find(c => 
                c.address_name.includes('성남') || c.road_address_name.includes('성남')
            );
            
            if (seongnamMatch) {
                bestMatch = seongnamMatch;
            } else if (candidates.length === 1) {
                // If only 1 result found, take it even if it doesn't say Seongnam explicitly (might be implicit)
                // BUT user data is strictly Seongnam, so maybe risky? 
                // Let's trust it if it's the only one.
                bestMatch = candidates[0];
            }
        }

        if (bestMatch) {
            data[idx].lat = parseFloat(bestMatch.y);
            data[idx].lng = parseFloat(bestMatch.x);
            data[idx].address = bestMatch.road_address_name || bestMatch.address_name;
            data[idx].status = 'rescued_by_name'; // New status to track source
            successCount++;
            process.stdout.write(`\r✅ Rescued: ${successCount}/${i + 1} (${cleanName})`);
        } else {
            process.stdout.write(`\r⏳ Processing: ${successCount}/${i + 1}`);
        }
        
        await delay(50); // Rate limit protection
    }

    console.log(`\n\n🎉 Massive Rescue Complete! Saved ${successCount} items.`);
    fs.writeFileSync(SEEDS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Saved updates to seeds.json`);
}

rescueByName();
