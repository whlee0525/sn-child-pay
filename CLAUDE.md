# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 작업 원칙

### 코딩 원칙
1. **재사용성 (Reusability)**
   - 반복되는 코드는 컴포넌트나 함수로 추출
   - 공통 UI 패턴은 재사용 가능한 컴포넌트로 분리
   - Props를 통한 유연한 설정 지원

2. **파일 분리 (File Separation)**
   - 관심사별로 파일 분리 (컴포넌트, 훅, 유틸, 타입 등)
   - 파일 크기가 커지면 적절히 분할
   - 명확한 디렉토리 구조 유지

3. **컴포넌트화 (Componentization)**
   - 단일 책임 원칙 (SRP) 준수
   - UI 요소는 독립적인 컴포넌트로 분리
   - 컴포넌트는 작고 명확한 목적을 가지도록

4. **YAGNI (You Aren't Gonna Need It)**
   - 지금 필요한 기능만 구현
   - 미래를 위한 과도한 추상화 금지
   - 현재 프로젝트에서 실제로 반복되는 코드에만 집중
   - 추측성 일반화 지양

### 응답 규칙
- **매 응답 시작**: 작업 원칙 요약 박스 표시
- **매 응답 끝**: 토큰 사용량 표시 `남은양/전체(남은%)`
- 한국어로 응답
- 이모지 사용 안 함 (명시적 요청 시에만)

## 프로젝트 개요

성남시 아동수당 포인트를 사용할 수 있는 가맹점을 지도에 표시하는 React 웹 애플리케이션입니다.

**기술 스택**: React + Vite + TypeScript + Tailwind CSS + Kakao Maps API

**특징**:
- 모바일 우선 설계 (PC는 중앙에 모바일 레이아웃 표시)
- 클러스터링을 통한 대용량 마커 성능 최적화 (Supercluster)
- 정적 데이터 기반 (공공데이터 CSV → Geocoding → JSON)

## 주요 개발 명령어

```bash
# 개발 서버 실행 (host: true로 모바일 테스트 가능)
npm run dev

# 프로덕션 빌드
npm run build

# Lint 검사
npm run lint

# Geocoding: CSV 데이터를 좌표 데이터로 변환
npm run geocode
```

## 데이터 파이프라인

이 프로젝트는 **정적 CSV 데이터**를 기반으로 하며, 다음 프로세스를 따릅니다:

1. **원본 데이터**: `raw_data/data2025.csv` (성남시 공공데이터포털)
2. **Geocoding**: `npm run geocode` 실행 → Kakao Local API로 주소를 좌표로 변환
3. **출력**: `src/data/seeds.json` (전체 데이터)
4. **최적화**: `scripts/clean_and_min.js` → `src/data/seeds.min.json` (프로덕션용)

**중요**:
- 데이터 업데이트 시 `npm run geocode` 실행 필요
- Geocoding API 키는 `.env`의 `VITE_KAKAO_MAP_API_KEY` 사용
- 최종 앱은 `seeds.min.json`을 import하여 사용

## 코드 아키텍처

### 디렉토리 구조

```
src/
├── App.tsx              # 메인 컴포넌트 (지도, 검색, 상태 관리)
├── components/
│   ├── BottomSheet.tsx      # 모바일/PC 대응 슬라이드 패널
│   ├── StoreDetailView.tsx  # 개별 가맹점 상세 정보
│   └── StoreListView.tsx    # 클러스터/검색 결과 리스트
├── hooks/
│   └── useSupercluster.ts   # Supercluster 래퍼 훅
├── data/
│   ├── seeds.json           # 전체 geocoded 데이터
│   └── seeds.min.json       # 최적화된 데이터 (앱에서 사용)
└── types/                   # (비어있음, 필요시 타입 추가)

scripts/
├── geocode.js               # 메인 geocoding 스크립트
├── clean_and_min.js         # 데이터 최적화 스크립트
└── ...                      # geocoding 실패 분석/재시도 스크립트
```

### 데이터 모델

**앱에서 사용하는 StoreData 인터페이스** (`App.tsx` 참고):

```typescript
interface StoreData {
  id: number;
  n: string;        // name (상호명)
  c: string;        // category (업종)
  a: string;        // address (주소)
  l: [number, number]; // [lat, lng] (위도, 경도)
}
```

**최적화 이유**: 속성명을 1글자로 축약하여 JSON 파일 크기 50% 감소

### 주요 상태 관리 (App.tsx)

- **`map`**: Kakao Map 인스턴스
- **`bounds`**: 현재 지도 범위 (클러스터링에 사용)
- **`level`**: 지도 줌 레벨 (Kakao는 낮을수록 확대)
- **`searchQuery`**: 검색어 (상호명/주소 필터링)
- **`selectedStore`**: 선택된 개별 가맹점 (상세 보기)
- **`clusterStores`**: 클러스터 클릭 시 해당 가맹점 목록
- **`isFromSearch`**: 리스트가 검색 결과인지 클러스터 결과인지 구분
- **`highlightedStoreId`**: 리스트에서 선택한 마커 강조 표시

### 컴포넌트 책임

**App.tsx**:
- 지도 렌더링 및 마커 표시
- 검색 로직 (debounce 500ms)
- 클러스터링 (useSupercluster)
- BottomSheet 열기/닫기 제어
- 마커/리스트 아이템 클릭 시 화면 이동 (panTo)

**BottomSheet.tsx**:
- 모바일: 하단 슬라이드업 패널
- PC: 좌측 사이드바 슬라이드
- 백드롭 처리 (모바일만)
- 뒤로 가기 버튼 지원 (리스트 ← 상세)

**StoreListView.tsx**:
- 클러스터 내 가맹점 리스트 표시
- 검색 결과 리스트 표시
- 리스트 아이템 클릭 시 지도 중심 이동 + 마커 강조

**StoreDetailView.tsx**:
- 개별 가맹점 상세 정보 카드 표시

### 성능 최적화 전략

1. **클러스터링** (Supercluster):
   - 기본 반경 100px, maxZoom 22
   - 실시간 bounds 기반 클러스터 계산
   - GeoJSON Feature 포맷 변환 필요 (`useSupercluster.ts` 참고)

2. **데이터 최적화**:
   - 키 이름 축약 (name → n)
   - seeds.min.json 사용 (빌드 시)

3. **검색 Debounce**:
   - 500ms 대기 후 검색 실행
   - 자동 지도 범위 조정 (fitBoundsToResults)

4. **지도 이벤트 최적화**:
   - `idle` 이벤트에서 bounds 업데이트
   - 불필요한 리렌더링 방지

## Path Alias 설정

`tsconfig.json`과 `vite.config.ts`에 `@/*` alias 설정되어 있음:

```typescript
import Something from '@/components/Something';
```

## 환경 변수 (.env)

```bash
VITE_KAKAO_MAP_API_KEY=your_kakao_map_javascript_key
```

**주의**: Geocoding 스크립트는 REST API 키를 우선 사용하지만, 없으면 위 키를 fallback으로 사용합니다.

## 주의사항

- **Kakao Map 로딩**: `useKakaoLoader` 훅으로 스크립트 로드 필수
- **좌표 순서**: Kakao API는 [lng, lat] 순서 사용 (일반적인 [lat, lng]와 반대)
- **Supercluster**: GeoJSON 포맷 필수 (`[lng, lat]` 순서)
- **지도 레벨**: Kakao는 숫자가 작을수록 확대 (1=최대 확대, 14=최대 축소)
- **모바일 테스트**: `vite.config.ts`의 `server.host: true`로 로컬 네트워크 접근 가능

## Geocoding 스크립트 (`scripts/geocode.js`)

CSV 파일의 주소 데이터를 Kakao Local API를 통해 좌표로 변환합니다.

**특징**:
- `raw_data/` 디렉토리에서 `data*.csv` 파일 자동 탐색
- EUC-KR → UTF-8 변환 (iconv-lite)
- API 호출 제한 방지 (100ms 딜레이)
- 실패 시 로그 출력 (추가 재시도 스크립트 별도 존재)

**실패 처리 스크립트** (필요 시 사용):
- `geocode_retry.js`: 실패한 주소 재시도
- `geocode_rescue_name.js`: 상호명 기반 검색
- `analyze_failures.js`: 실패 원인 분석

## Tailwind CSS 사용법

- **반응형**: `md:` 접두사 (768px 이상 = PC)
- **주요 패턴**:
  - 모바일: `bottom-0 rounded-t-[28px]`
  - PC: `md:top-0 md:left-0 md:rounded-r-xl`
- **애니메이션**: `transition-transform duration-300`
