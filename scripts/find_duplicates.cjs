const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');
const FILES = ['jungwon.json', 'sujeong.json', 'bundang.json'];

function normalizeName(name) {
  return name
    .replace(/\(주\)|\(사\)|\(유\)|\(복\)|주식회사|사단법인/g, '')
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function normalizeAddress(address) {
  return address
    .replace(/경기도|경기/g, '')
    .replace(/성남시\s+(중원구|수정구|분당구)/g, '')
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

// 좌표를 소수점 n자리까지 반올림하여 그룹화 (약 1.1m 정밀도 = 5자리)
function getCoordKey(lat, lng) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

async function findDuplicates() {
  const allStores = [];
  
  for (const file of FILES) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allStores.push(...data.map(s => ({ ...s, source: file })));
  }

  const groups = new Map();

  allStores.forEach(store => {
    const coordKey = getCoordKey(store.l[0], store.l[1]);
    if (!groups.has(coordKey)) {
      groups.set(coordKey, []);
    }
    groups.get(coordKey).push(store);
  });

  const reviewList = [];

  for (const [coord, stores] of groups.entries()) {
    if (stores.length < 2) continue;

    const clustersInCoord = [];
    const usedIndices = new Set();

    for (let i = 0; i < stores.length; i++) {
        if (usedIndices.has(i)) continue;
        
        const currentCluster = [stores[i]];
        const nameI = normalizeName(stores[i].n);
        
        for (let j = i + 1; j < stores.length; j++) {
            if (usedIndices.has(j)) continue;
            
            const nameJ = normalizeName(stores[j].n);
            
            // 이름 유사도 판단: 한쪽이 다른 쪽을 포함하거나 90% 이상 일치하는 경우
            if (nameI.includes(nameJ) || nameJ.includes(nameI)) {
                currentCluster.push(stores[j]);
                usedIndices.add(j);
            }
        }
        
        if (currentCluster.length > 1) {
            clustersInCoord.push(currentCluster);
            usedIndices.add(i);
        }
    }

    if (clustersInCoord.length > 0) {
        clustersInCoord.forEach(cluster => {
            reviewList.push({
                coordinate: coord,
                count: cluster.length,
                stores: cluster.map(s => ({
                    id: s.id,
                    name: s.n,
                    normalizedName: normalizeName(s.n),
                    address: s.a,
                    category: s.c,
                    source: s.source
                })),
                recommendation: {
                    keep: cluster[0].id, // 일단 첫 번째 ID를 유지 권장
                    remove: cluster.slice(1).map(s => s.id)
                }
            });
        });
    }
  }

  const outputPath = path.join(__dirname, '../duplicates_review.json');
  fs.writeFileSync(outputPath, JSON.stringify(reviewList, null, 2), 'utf8');
  console.log(`정밀 검사 결과, 중복 의심 그룹 ${reviewList.length}개를 발견하여 duplicates_review.json에 저장했습니다.`);
}

findDuplicates().catch(console.error);
