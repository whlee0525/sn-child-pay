const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');
const REVIEW_FILE = path.join(__dirname, '../duplicates_review.json');
const FILES = ['jungwon.json', 'sujeong.json', 'bundang.json'];

function mergeDuplicates() {
  // 1. 중복 의심 리스트 로드
  const reviewData = JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf8'));
  const idsToRemove = new Set();
  
  reviewData.forEach(group => {
    if (group.recommendation && group.recommendation.remove) {
      group.recommendation.remove.forEach(id => idsToRemove.add(id));
    }
  });

  console.log(`총 ${idsToRemove.size}개의 중복 데이터를 제거할 예정입니다.`);

  let totalBefore = 0;
  let totalAfter = 0;
  const allMergedData = [];

  // 2. 각 파일별 실 데이터 제거
  FILES.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    totalBefore += data.length;
    
    const cleanedData = data.filter(store => !idsToRemove.has(store.id));
    
    totalAfter += cleanedData.length;
    allMergedData.push(...cleanedData);

    // 구별 파일 저장
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf8');
    console.log(`${file}: ${data.length} -> ${cleanedData.length} (정리 완료)`);
  });

  // 3. all.json 갱신
  const allPath = path.join(DATA_DIR, 'all.json');
  fs.writeFileSync(allPath, JSON.stringify(allMergedData, null, 2), 'utf8');
  
  console.log('-------------------------------------------');
  console.log(`전체 요약: ${totalBefore} -> ${totalAfter} (총 ${totalBefore - totalAfter}개 제거됨)`);
  console.log('all.json 갱신 완료.');
}

mergeDuplicates();
