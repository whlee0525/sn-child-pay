import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import iconv from 'iconv-lite';
import fetch from 'node-fetch';

dotenv.config();

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_MAP_API_KEY; 
const INPUT_DIR = path.join(process.cwd(), 'raw_data');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'seeds.json');

if (!KAKAO_API_KEY) {
  console.error('❌ Error: VITE_KAKAO_MAP_API_KEY is missing in .env');
  process.exit(1);
}

// Find the latest CSV file
if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Error: Input directory ${INPUT_DIR} does not exist.`);
    process.exit(1);
}
const files = fs.readdirSync(INPUT_DIR);
const csvFile = files.find(file => file.startsWith('data') && file.endsWith('.csv'));

if (!csvFile) {
  console.error('❌ Error: No CSV file found starting with "data" (e.g., data2025.csv)');
  process.exit(1);
}

console.log(`📂 Found data file: ${csvFile}`);

const results = [];
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address) {
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (data.documents && data.documents.length > 0) {
      const { x, y } = data.documents[0]; // x: longitude, y: latitude
      return { lat: parseFloat(y), lng: parseFloat(x) };
    }
    return null;
  } catch (error) {
      // Re-throw critical errors to stop the script
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('429')) {
          throw error;
      }
    console.error(`Failed to geocode: ${address}`, error.message);
    return null;
  }
}

async function processCsv() {
  // Read file with EUC-KR decoding
  const buffer = fs.readFileSync(path.join(INPUT_DIR, csvFile));
  const content = iconv.decode(buffer, 'euc-kr');
  
  // Split by line and handle basic CSV parsing manually
  const rows = content.split('\n').map(line => line.trim()).filter(line => line);
  const headers = rows[0].split(',').map(h => h.trim());
  
  console.log('📊 Detected headers:', headers);
  
  // Identify column indices
  const nameIdx = headers.findIndex(h => h.includes('명') || h.includes('상호'));
  const catIdx = headers.findIndex(h => h.includes('업종'));
  const addrIdx = headers.findIndex(h => h.includes('주소') || h.includes('소재지'));

  if (addrIdx === -1) {
    console.error('❌ Error: Could not find address column. Headers:', headers);
    return;
  }

  console.log(`🚀 Starting geocoding for ${rows.length - 1} items...`);
  
  // Create output dir if not exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let successCount = 0;
  let consecutiveErrors = 0;
  
  // Use a smaller batch for testing, remove slice for full run
  const dataRows = rows.slice(1); 
  
  for (let i = 0; i < dataRows.length; i++) {
    const cols = dataRows[i].split(','); 
    
    // Simple bounds check
    if (cols.length < addrIdx) continue;

    const name = cols[nameIdx];
    const category = cols[catIdx];
    let address = cols[addrIdx];

    // Handle quoted address
    if (dataRows[i].includes('"')) {
        const match = dataRows[i].match(/"([^"]+)"/); 
        if (match && (match[1].includes('성남') || match[1].includes('경기'))) {
            address = match[1];
        }
    }
    
    if (!address) continue;

    // Clean address strategies
    let cleanAddr = address
        .replace(/\(.*?\)/g, '') 
        .replace(/,.*$/, '') 
        .replace(/\s+/g, ' ') 
        .trim();

    let coords = null;

    try {
        coords = await geocodeAddress(cleanAddr);
        
        // Retry with simpler address if failed
        if (!coords) {
             const simplerAddr = cleanAddr.replace(/\s\d+.*$/, ''); 
             if (simplerAddr !== cleanAddr) coords = await geocodeAddress(simplerAddr);
        }
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('429')) {
             console.error(`\n\n🛑 CRITICAL ERROR: ${error.message} - Stopping script to protect quota/key.`);
             break;
        }
    }

    if (coords) {
      results.push({
        id: i,
        name,
        category,
        address, 
        lat: coords.lat,
        lng: coords.lng,
        status: 'normal',
        reports: 0,
        confirms: 0
      });
      successCount++;
      consecutiveErrors = 0; 
      process.stdout.write(`\r✅ Progress: ${i + 1}/${dataRows.length} (Success: ${successCount})`);
    } else {
      results.push({
        id: i,
        name,
        category,
        address,
        lat: null,
        lng: null,
        status: 'geocode_failed',
        reports: 0,
        confirms: 0
      });
      
      consecutiveErrors++;
      process.stdout.write(`\r✅ Progress: ${i + 1}/${dataRows.length} (Success: ${successCount})`);
      
      if (consecutiveErrors >= 50) { 
          console.error(`\n\n🛑 Stopping: Too many consecutive data failures (${consecutiveErrors}). Checking if something is wrong with the data format.`);
          break;
      }
    }
    
    await delay(20); 
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n🎉 Done! Saved ${results.length} items to ${OUTPUT_FILE}`);
}

processCsv();
