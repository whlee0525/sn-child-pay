import { useEffect, useRef } from 'react';

export function CoupangBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // 가로 너비에 따른 비례 높이 계산 (기본 320:50 비율)
  // 320:50 => 6.4:1
  // 최대 높이는 75px로 제한
  const getCalculatedHeight = () => {
    const width = window.innerWidth > 480 ? 480 : window.innerWidth; // 너무 큰 화면 대비
    const proportionalHeight = Math.floor(width / 6.4);
    return Math.min(75, Math.max(50, proportionalHeight)); // 최소 50, 최대 75
  };

  useEffect(() => {
    if (isDev) return;
    if (!containerRef.current) return;

    const calculatedHeight = getCalculatedHeight();

    // 실제 배포 환경에서만 스크립트 로드
    const script = document.createElement('script');
    script.src = "https://ads-partners.coupang.com/g.js";
    script.async = true;

    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      new PartnersCoupang.G({
        "id": 954727,
        "template": "carousel",
        "trackingCode": "AF0762988",
        "width": "100%",
        "height": "${calculatedHeight}",
        "tsource": ""
      });
    `;

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(inlineScript);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isDev]);

  const calculatedHeight = getCalculatedHeight();

  // 개발 환경용 더미 UI
  if (isDev) {
    return (
      <div 
        className="flex justify-center w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg items-center overflow-hidden transition-all duration-300"
        style={{ height: `${calculatedHeight}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="bg-gray-200 text-[10px] text-gray-400 px-1 rounded font-sans">쿠팡 AD</span>
          <p className="text-[11px] text-gray-400 font-sans">가로 100% / 높이 {calculatedHeight}px 적용됨</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center w-full overflow-hidden rounded-lg transition-all duration-300"
      style={{ minHeight: `${calculatedHeight}px` }}
    >
      <div ref={containerRef} className="w-full"></div>
    </div>
  );
}
