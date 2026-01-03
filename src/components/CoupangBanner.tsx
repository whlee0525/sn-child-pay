import { useEffect, useRef } from 'react';

interface CoupangBannerProps {
  format?: 'mobile' | 'pc-vertical';
}

export function CoupangBanner({ format = 'mobile' }: CoupangBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // 가로 너비에 따른 비례 높이 계산 (기본 320:50 비율)
  // 320:50 => 6.4:1
  // 최대 높이는 75px로 제한
  const getCalculatedHeight = () => {
    if (format === 'pc-vertical') return 600;
    
    const width = window.innerWidth > 480 ? 480 : window.innerWidth; // 너무 큰 화면 대비
    const proportionalHeight = Math.floor(width / 6.4);
    return Math.min(75, Math.max(50, proportionalHeight)); // 최소 50, 최대 75
  };

  useEffect(() => {
    if (isDev) return;
    if (!containerRef.current) return;

    const calculatedHeight = getCalculatedHeight();
    const isPcVertical = format === 'pc-vertical';

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
        "width": "${isPcVertical ? '160' : '100%'}",
        "height": "${isPcVertical ? '600' : calculatedHeight}",
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
  }, [isDev, format]);

  const calculatedHeight = getCalculatedHeight();
  const isPcVertical = format === 'pc-vertical';

  // 개발 환경용 더미 UI
  if (isDev) {
    if (isPcVertical) {
      return (
        <div 
          className="flex flex-col items-center justify-between py-10 px-2 w-[160px] h-[600px] bg-gray-50 border border-dashed border-gray-300 rounded-lg overflow-hidden"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="bg-gray-200 text-[10px] text-gray-400 px-1 rounded font-sans">쿠팡 AD</span>
            <div>
              <p className="text-sm font-bold text-gray-400">PC 우측 광고</p>
              <p className="text-xs text-gray-400 mt-2">160 x 600</p>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 text-center leading-tight">
            개발 환경에서는<br/>광고가 노출되지 않습니다
          </div>
        </div>
      );
    }

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
      className={`flex justify-center overflow-hidden rounded-lg transition-all duration-300 ${isPcVertical ? 'w-[160px] h-[600px]' : 'w-full'}`}
      style={!isPcVertical ? { minHeight: `${calculatedHeight}px` } : {}}
    >
      <div ref={containerRef} className={isPcVertical ? 'w-[160px]' : 'w-full'}></div>
    </div>
  );
}
