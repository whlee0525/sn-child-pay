import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Filter for failures that are just 5-digit zip codes
    const zipFailures = data.filter(item => {
        return item.status === 'geocode_failed' && /^\d{5}$/.test(item.address.trim());
    });

    console.log(`\n🔍 Found ${zipFailures.length} zip-code-only records.`);
    console.log('Here are 15 examples for your review:\n');

    zipFailures.slice(0, 15).forEach((item, index) => {
        console.log(`${index + 1}. [${item.category}] ${item.name}`);
        console.log(`   Data: "${item.address}"`);
    });

} catch (error) {
    console.error('Error:', error);
}
