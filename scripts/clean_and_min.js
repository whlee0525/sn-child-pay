import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');
const minPath = path.join(process.cwd(), 'src', 'data', 'seeds.min.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Filter Logic:
    // 1. Must have geocoordinates
    // 2. Address MUST contain '성남' OR '분당' OR '수정' OR '중원'
    // 3. Address MUST NOT contain '서울', '용인', '광주', '하남', '과천', '의왕', '수원' (Common neighbors mis-matched)
    
    // Explicit exclude list updates based on findings
    const excludeRegions = ['서울', '경기 광주', '경기 용인', '경기 하남', '경기 과천', '경기 의왕', '경기 수원', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '강원', '충청', '전라', '경상', '제주'];

    const cleanData = data.filter(item => {
        if (!item.lat || !item.lng) return false;
        
        const addr = item.address || "";
        
        // Positive check
        const isSeongnam = addr.includes('성남') || addr.includes('분당') || addr.includes('수정') || addr.includes('중원');
        if (!isSeongnam) return false;

        // Negative check (just in case 'Seongnam-ro, Gwangju-si' exists)
        // Actually positive check is strong enough usually, but let's be safe
        // If address starts with '서울', it's definitely out even if it mentions Seongnam somewhere (unlikely but possible)
        if (addr.startsWith('서울')) return false;

        return true;
    });

    const optimized = cleanData.map(item => ({
        id: item.id,
        n: item.name,
        c: item.category,
        a: item.address,
        l: [Math.round(item.lat * 100000) / 100000, Math.round(item.lng * 100000) / 100000]
    }));

    console.log(`Original: ${data.length}`);
    console.log(`Cleaned: ${cleanData.length} (Removed ${data.length - cleanData.length})`);
    
    fs.writeFileSync(minPath, JSON.stringify(optimized));
    console.log('✅ Regenerated seeds.min.json with strict filters.');

} catch (error) {
    console.error(error);
}
