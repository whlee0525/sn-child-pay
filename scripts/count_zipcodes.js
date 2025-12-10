import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    const failures = data.filter(item => item.status === 'geocode_failed');
    
    // Count pure digital addresses (likely zip codes)
    const zipCodeOnly = failures.filter(item => {
        const addr = item.address.trim();
        return /^\d{5}$/.test(addr); // Exact 5 digits
    });
    
    // Check if they are in Seongnam range (13xxx)
    const seongnamZips = zipCodeOnly.filter(item => item.address.startsWith('13'));

    console.log(`\n📊 Zip Code Analysis:`);
    console.log(`- Total Failures: ${failures.length}`);
    console.log(`- pure 5-digit number (Zip Code): ${zipCodeOnly.length}`);
    console.log(`- Seongnam Zip Codes (starts with 13): ${seongnamZips.length}`);
    
    if (zipCodeOnly.length > 0) {
        console.log('\nSample Zip Entries:');
        zipCodeOnly.slice(0, 10).forEach(item => console.log(`[${item.category}] ${item.name}: ${item.address}`));
    }

} catch (error) {
    console.error(error);
}
