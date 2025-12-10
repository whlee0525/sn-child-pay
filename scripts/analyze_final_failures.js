import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Filter strictly failed items
    const failures = data.filter(item => item.status === 'geocode_failed');
    
    // Group by Category
    const categoryCounts = {};
    failures.forEach(item => {
        const cat = item.category || "Unknown";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Sort by count
    const sortedCats = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1]);

    console.log(`\n📊 Final Failures Analysis (Total: ${failures.length})`);
    console.log(`Top 10 Failed Categories:\n`);

    sortedCats.slice(0, 10).forEach(([cat, count], idx) => {
        const percent = ((count / failures.length) * 100).toFixed(1);
        console.log(`${idx + 1}. ${cat}: ${count}건 (${percent}%)`);
    });

    console.log('\n🔍 Sample Names by Top Categories:');
    sortedCats.slice(0, 5).forEach(([cat]) => {
        const samples = failures
            .filter(i => i.category === cat)
            .slice(0, 3)
            .map(i => i.name)
            .join(', ');
        console.log(`- ${cat}: ${samples}`);
    });

} catch (error) {
    console.error(error);
}
