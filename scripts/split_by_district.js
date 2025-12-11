/**
 * seeds.min.json을 구별로 분할하는 스크립트
 * 중원구, 수정구, 분당구 3개 파일로 분리
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로
const INPUT_FILE = path.join(__dirname, '../src/data/seeds.min.json');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// 구별 데이터 저장
const districts = {
  jungwon: [], // 중원구
  sujeong: [], // 수정구
  bundang: [], // 분당구
  other: []    // 미분류
};

console.log('📂 데이터 파일 읽는 중...');
const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
const stores = JSON.parse(rawData);

console.log(`✅ 전체 ${stores.length.toLocaleString()}개 가맹점 로드 완료\n`);

// 구별로 분류
console.log('🔍 구별로 데이터 분류 중...');
stores.forEach(store => {
  const address = store.a; // 주소 필드

  if (address.includes('중원구')) {
    districts.jungwon.push(store);
  } else if (address.includes('수정구')) {
    districts.sujeong.push(store);
  } else if (address.includes('분당구')) {
    districts.bundang.push(store);
  } else {
    districts.other.push(store);
    console.warn(`⚠️  미분류 데이터: ${store.n} (${address})`);
  }
});

console.log('\n📊 분류 결과:');
console.log(`  중원구: ${districts.jungwon.length.toLocaleString()}개 (${(districts.jungwon.length / stores.length * 100).toFixed(1)}%)`);
console.log(`  수정구: ${districts.sujeong.length.toLocaleString()}개 (${(districts.sujeong.length / stores.length * 100).toFixed(1)}%)`);
console.log(`  분당구: ${districts.bundang.length.toLocaleString()}개 (${(districts.bundang.length / stores.length * 100).toFixed(1)}%)`);
if (districts.other.length > 0) {
  console.log(`  미분류: ${districts.other.length}개`);
}

// public/data 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\n📁 디렉토리 생성: ${OUTPUT_DIR}`);
}

// 파일 저장 함수
function saveDistrictFile(districtKey, fileName) {
  const data = districtKey === 'all'
    ? [...districts.jungwon, ...districts.sujeong, ...districts.bundang, ...districts.other]
    : districts[districtKey];

  const filePath = path.join(OUTPUT_DIR, fileName);
  const jsonString = JSON.stringify(data);

  fs.writeFileSync(filePath, jsonString, 'utf-8');

  const sizeKB = (Buffer.byteLength(jsonString, 'utf-8') / 1024).toFixed(1);
  console.log(`  ✅ ${fileName}: ${data.length.toLocaleString()}개 (${sizeKB} KB)`);
}

// 각 구별 파일 저장
console.log('\n💾 파일 저장 중...');
saveDistrictFile('jungwon', 'jungwon.json');
saveDistrictFile('sujeong', 'sujeong.json');
saveDistrictFile('bundang', 'bundang.json');

// 전체 데이터도 저장 (fallback용)
saveDistrictFile('all', 'all.json');

console.log('\n✨ 완료!');
console.log(`\n📍 로딩 순서 권장:`);
console.log(`  1. jungwon.json (초기 화면)`);
console.log(`  2. sujeong.json + bundang.json (병렬)`);
