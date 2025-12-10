import { useEffect, useRef } from 'react';

export function AdBanner() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 광고 단위 ID (Kakao AdFit에서 발급받은 ID로 교체)
    const adUnitId = import.meta.env.VITE_KAKAO_ADFIT_UNIT_ID;

    // 개발 모드이거나 광고 ID가 없으면 더미 광고 표시
    if (!adUnitId || import.meta.env.DEV) {
      return;
    }

    // Kakao AdFit 스크립트 동적 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://t1.daumcdn.net/kas/static/ba.min.js`;
    script.setAttribute('charset', 'utf-8');

    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  // 개발 모드 또는 광고 ID 없을 때 더미 광고
  const adUnitId = import.meta.env.VITE_KAKAO_ADFIT_UNIT_ID;
  if (!adUnitId || import.meta.env.DEV) {
    return (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">성남사랑상품권</p>
            <p className="text-sm font-bold text-gray-800">이번 달 최대 10% 캐시백 혜택!</p>
          </div>
          <button className="px-3 py-1.5 bg-[#004098] text-white text-xs font-bold rounded-lg hover:bg-[#003377] transition-colors">
            보기
          </button>
        </div>
      </div>
    );
  }

  // 실제 광고
  return (
    <div className="w-full flex justify-center overflow-hidden">
      <div
        ref={adContainerRef}
        className="w-full max-w-full"
      >
        {/* Kakao AdFit 반응형 광고 */}
        <ins
          className="kakao_ad_area"
          style={{ display: 'block' }}
          data-ad-unit={adUnitId}
          data-ad-width="responsive"
          data-ad-height="auto"
        ></ins>
      </div>
    </div>
  );
}
