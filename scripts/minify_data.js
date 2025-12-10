import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'src', 'data', 'seeds.json');
const outputPath = path.join(process.cwd(), 'src', 'data', 'seeds.min.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Filter out items that are still failed (if any) - we only want valid ones for the map
    // Also remove extra fields like 'status' if not needed for display
    const optimized = data
        .filter(item => item.lat && item.lng) // Only items with coords
        .map(item => ({
            id: item.id,
            n: item.name,          // Shorten keys for size
            c: item.category,
            a: item.address,
            l: [Math.round(item.lat * 100000) / 100000, Math.round(item.lng * 100000) / 100000] // Round coords to 5 decimal places (approx 1m precision)
        }));

    console.log(`Original items: ${data.length}`);
    console.log(`Optimized items: ${optimized.length}`);

    fs.writeFileSync(outputPath, JSON.stringify(optimized));
    
    // Check sizes
    const statsIn = fs.statSync(inputPath);
    const statsOut = fs.statSync(outputPath);
    
    console.log(`\nOriginal Size: ${(statsIn.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Optimized Size: ${(statsOut.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Reduction: -${((1 - statsOut.size / statsIn.size) * 100).toFixed(1)}%`);

} catch (error) {
    console.error(error);
}
