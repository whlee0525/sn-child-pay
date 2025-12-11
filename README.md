# 아동수당 가맹점 지도 (SN Child Pay)

성남시 아동수당을 사용할 수 있는 가맹점을 지도에서 한눈에 확인하는 서비스.
신한카드에서 제공하는 2025년 6월기준 데이터를 바탕으로 작업되었으며,
매년 신규 데이터가 있는지 확인하여 업데이트 예정.

아동수당 사용처를 확인하기가 어려워서 직접 개발하게 되었으며
아래 사이트들에서는 지역 및 업종별 검색을 제공 중.
https://www.shinhancard.com/pconts/html/benefit/point/snRebate/MOBFM355R02.html

실제 코드작성은 하지 않고, 바이브코딩만으로 작업.

## 주요 기능

- 📍 **가맹점 지도 표시**: 성남시 내 가맹점 위치를 지도상에 마커로 표시
- 🔍 **검색 기능**: 업종별, 업체명별 검색 지원
- 📱 **반응형 디자인**: 모바일 및 PC 환경 지원

## 추후 개발 예정

- **사용 성공 및 신고 기능**: 사용자가 아동수당 결제를 성공했는지, 실패했는지 내용을 공유할 수 있는 기능

## 기술 스택

- **Client**: React (v19), TypeScript, TailwindCSS
- **Map Engine**: Kakao Maps API (`react-kakao-maps-sdk`)
- **Build Tool**: Vite
- **Data Processing**: Node.js scripts (`csv-parser`, `iconv-lite`)

## 설치 및 실행

### 1. 환경 변수 설정

최상위 경로에 `.env` 파일을 생성하고 카카오 맵 API 키를 입력하세요.

```env
VITE_KAKAO_MAP_API_KEY=your_kakao_api_key
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 데이터 전처리 (선택 사항)

원본 CSV 데이터를 변환하여 `seeds.json`을 생성합니다. (기본 데이터가 포함되어 있으므로 생략 가능)

```bash
# 전체 데이터 Geocoding 진행
npm run geocode
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 프로젝트 구조

```
src/
├── components/ # UI 컴포넌트
├── data/       # 전처리된 지도 데이터 (seeds.json)
├── pages/      # 페이지 단위 컴포넌트
└── scripts/    # 데이터 전처리 및 Geocoding 스크립트
```
