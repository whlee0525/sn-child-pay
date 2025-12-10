# SEO 체크리스트

## ✅ 완료된 작업 (배포 전)

- [x] index.html 메타 태그 최적화
- [x] Open Graph 태그 추가 (소셜 미디어 공유)
- [x] 구조화된 데이터 (Schema.org) 추가
- [x] 지역 SEO 메타 태그 추가
- [x] robots.txt 생성
- [x] sitemap.xml 생성

## 📋 배포 후 즉시 해야 할 일

### 1. 도메인 URL 업데이트
다음 파일에서 `YOUR-DOMAIN.com`을 실제 도메인으로 변경:

- [ ] `index.html` (17번째 줄, 33번째 줄)
- [ ] `public/robots.txt` (5번째 줄)
- [ ] `public/sitemap.xml` (11번째 줄)

**변경 방법:**
```bash
# 전체 검색 후 변경
grep -r "YOUR-DOMAIN.com" .
# 또는 에디터에서 Find & Replace 사용
```

### 2. OG 이미지 생성 및 추가

OG 이미지(Open Graph Image)는 카카오톡, 페이스북 등에 공유될 때 보이는 썸네일입니다.

**권장 사이즈:** 1200x630px (PNG 또는 JPG)

**만드는 방법:**
1. Canva, Figma 등에서 1200x630 캔버스 생성
2. 내용: "성남시 아동수당 사용처 지도" + 로고/아이콘 + 간단한 설명
3. `public/og-image.png`로 저장
4. `index.html` 21번째 줄 주석 해제:
   ```html
   <meta property="og:image" content="https://실제도메인.com/og-image.png">
   ```

### 3. Google Search Console 등록

**URL:** https://search.google.com/search-console

**절차:**
1. 속성 추가 > 도메인 입력
2. 소유권 확인 (HTML 태그 방식 권장)
   - 제공된 메타 태그를 `index.html` head에 추가
3. Sitemap 제출: `https://실제도메인.com/sitemap.xml`
4. URL 검사 요청

### 4. Naver Search Advisor 등록

**URL:** https://searchadvisor.naver.com

**절차:**
1. 웹마스터 도구 > 사이트 등록
2. 소유권 확인 (HTML 파일 업로드 방식)
   - 제공된 HTML 파일을 `public/` 폴더에 추가
3. 사이트 간단 체크 실행
4. 사이트맵 제출

### 5. 첫 인덱싱 확인

배포 후 1-2주 뒤:
```
Google: site:실제도메인.com
Naver: site:실제도메인.com
```

## 🚀 추가 최적화 (선택사항)

### A. 성능 최적화
```bash
# Lighthouse 점수 확인
npm run build
npx serve dist
# Chrome DevTools > Lighthouse 실행
```

**목표:**
- Performance: 90점 이상
- SEO: 100점
- Accessibility: 90점 이상

### B. 소셜 미디어 공유 테스트

**카카오톡 공유 테스트:**
https://developers.kakao.com/tool/debugger/sharing

**페이스북 공유 테스트:**
https://developers.facebook.com/tools/debug/

### C. 백링크 확보

- [ ] 성남시청 홈페이지 등록 요청
- [ ] 네이버 카페/블로그 작성
- [ ] 맘카페 공유
- [ ] GitHub README 업데이트

### D. 모니터링 도구 설치

**Google Analytics 4 (선택사항):**
1. https://analytics.google.com 에서 속성 생성
2. 제공된 GA4 태그를 `index.html`에 추가

**Naver Analytics (선택사항):**
1. https://analytics.naver.com 에서 사이트 등록
2. 스크립트 추가

## 📊 검색 키워드 전략

**주요 타겟 키워드:**
- 성남시 아동수당
- 성남시 아동수당 사용처
- 성남시 아동수당 가맹점
- 성남 아동수당 지도
- 분당 아동수당
- 판교 아동수당

**롱테일 키워드:**
- 성남시 아동수당 쓸수있는곳
- 성남 아동수당 포인트 사용
- 성남시 아동수당 한식
- 성남시 아동수당 학원

## 🔍 검색 결과 예상 시간

- **Google:** 1-2주 (Search Console 사용 시)
- **Naver:** 2-4주
- **상위 노출:** 2-3개월 (경쟁 키워드에 따라 다름)

## 💡 팁

1. **정기적인 업데이트:** 데이터를 주기적으로 업데이트하면 검색 순위에 유리
2. **모바일 최적화:** 이미 완료되어 있음 ✅
3. **페이지 속도:** Vite 빌드 결과물은 이미 최적화되어 있음
4. **콘텐츠 추가:** 나중에 FAQ, 이용가이드 페이지 추가 고려

## 📞 문의

문제가 발생하면:
- Google Search Console 도움말
- Naver Search Advisor 고객센터
