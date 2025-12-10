import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    const failures = data.filter(item => item.status === 'geocode_failed');
    
    // Filter for "Plausible Addresses"
    // Criteria: Must contain at least one address-like keyword AND be longer than 5 chars
    const keywords = ['시', '구', '동', '길', '로', '번지', '층', '호'];
    
    const plausibleFailures = failures.filter(item => {
        const addr = item.address;
        if (addr.length < 5) return false; // Too short
        if (/^\d+$/.test(addr)) return false; // Only numbers (zip code?)
        return keywords.some(k => addr.includes(k));
    });

    console.log(`\n📊 Analysis Round 2: Plausible Addresses`);
    console.log(`- Total Failures: ${failures.length}`);
    console.log(`- Plausible Addresses (look like valid addresses): ${plausibleFailures.length}`);

    console.log('\n🔍 Sample Plausible Failures (First 20):');
    plausibleFailures.slice(0, 20).forEach((item, index) => {
        console.log(`${index + 1}. [${item.category}] ${item.name}`);
        console.log(`   Address: "${item.address}"`);
    });
    
    // Quick pattern grouping on plausible ones
    const patterns = {
        'Has Parentheses': 0,
        'Has Comma': 0,
        'Missing Seongnam': 0
    };
    
    plausibleFailures.forEach(item => {
        if (item.address.includes('(')) patterns['Has Parentheses']++;
        if (item.address.includes(',')) patterns['Has Comma']++;
        if (!item.address.includes('성남') && !item.address.includes('경기')) patterns['Missing Seongnam']++;
    });
    
    console.log('\n💡 Patterns in Plausible Failures:');
    console.table(patterns);

} catch (error) {
    console.error('Error:', error);
}
