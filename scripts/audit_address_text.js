import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Strict Text Check
    // Must contain '성남' (Seongnam) OR ('분당','수정','중원' which are districts)
    // AND must contain '경기' (Gyeonggi province) - to avoid 'Seongnam-dong' in other cities if any
    
    const invalid = data.filter(item => {
        // Only check successful ones
        if (!item.lat || !item.lng) return false;

        const addr = item.address || "";
        const isSeongnam = addr.includes('성남') || addr.includes('분당') || addr.includes('수정') || addr.includes('중원');
        // Some addresses might be 'Gyeonggi-do Gwangju-si...' 
        
        return !isSeongnam;
    });

    console.log(`\n🕵️‍♂️ Address Text Audit:`);
    console.log(`Total Geocoded Items: ${data.filter(i => i.lat).length}`);
    console.log(`suspected Non-Seongnam Items: ${invalid.length}`);

    if (invalid.length > 0) {
        console.log('\n⚠️ Sample Invalid Addresses:');
        invalid.slice(0, 15).forEach(item => {
            console.log(`[${item.name}] (${item.status}) -> ${item.address}`);
        });
    }

} catch (error) {
    console.error(error);
}
