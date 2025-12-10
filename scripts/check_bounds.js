import fs from 'fs';
import path from 'path';

const seedsPath = path.join(process.cwd(), 'src', 'data', 'seeds.min.json');

try {
    const rawData = fs.readFileSync(seedsPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Approximate Seongnam Bounds (Wide buffer inc. Bundang, Sujeong, Jungwon)
    // lat: 37.3 ~ 37.5
    // lng: 127.0 ~ 127.2
    
    const bounds = {
        minLat: 37.33, maxLat: 37.55, // Covers slightly more than Seongnam
        minLng: 127.00, maxLng: 127.25
    };

    const outliers = data.filter(item => {
        const [lat, lng] = item.l;
        return lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng;
    });

    console.log(`Analyzing ${data.length} items...`);
    console.log(`Found ${outliers.length} outliers outside Seongnam area.`);
    
    if (outliers.length > 0) {
        console.log('Sample Outliers:');
        outliers.slice(0, 10).forEach(o => {
            console.log(`- ${o.n} (${o.a}): [${o.l[0]}, ${o.l[1]}]`);
        });
    }

} catch (error) {
    console.error(error);
}
