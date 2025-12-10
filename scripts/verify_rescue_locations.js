import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Filter items rescued by name
    const rescued = data.filter(item => item.status === 'rescued_by_name');
    
    // Check how many have '성남', '분당', '수정', '중원' in their new address
    const inSeongnam = rescued.filter(item => {
        const addr = item.address;
        return addr.includes('성남') || addr.includes('분당') || addr.includes('수정') || addr.includes('중원');
    });

    console.log(`\n🕵️‍♂️ Rescue Verification Report:`);
    console.log(`- Total Rescued: ${rescued.length}`);
    console.log(`- Confirmed in Seongnam: ${inSeongnam.length} (${((inSeongnam.length / rescued.length) * 100).toFixed(1)}%)`);
    console.log(`- Others (Potential Risk): ${rescued.length - inSeongnam.length}`);

    if (rescued.length - inSeongnam.length > 0) {
        console.log('\n⚠️ Sample of Non-Seongnam Rescues (Need Verification):');
        const risky = rescued.filter(item => !inSeongnam.includes(item));
        risky.slice(0, 15).forEach(item => {
            console.log(`[${item.name}] -> ${item.address}`);
        });
    }

} catch (error) {
    console.error(error);
}
