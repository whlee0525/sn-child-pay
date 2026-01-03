import { useEffect, useRef, useMemo } from 'react';

declare global {
  interface Window {
    PartnersCoupang: {
      G: new (config: {
        id: number;
        template: string;
        trackingCode: string;
        width: string;
        height: string;
        tsource: string;
        container?: string;
      }) => void;
    };
  }
}

interface CoupangBannerProps {
  format?: 'mobile' | 'pc-vertical';
  id?: string;
}

export function CoupangBanner({ format = 'mobile', id: propsId }: CoupangBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // 컨테이너 ID를 컴포넌트 생명주기 동안 안정적으로 유지
  const bannerContainerId = useMemo(() => {
    if (propsId) return propsId;
    return `coupang-banner-${format}-${Math.random().toString(36).substring(2, 9)}`;
  }, [propsId, format]);

  const getCalculatedHeight = () => {
    if (format === 'pc-vertical') return 600;
    
    // 모바일에서는 화면 너비에 따라 비례 제어
    const width = typeof window !== 'undefined' ? (window.innerWidth > 480 ? 480 : window.innerWidth) : 320;
    const proportionalHeight = Math.floor(width / 6.4);
    return Math.min(75, Math.max(50, proportionalHeight));
  };

  useEffect(() => {
    if (isDev) return;
    if (!containerRef.current) return;

    const calculatedHeight = getCalculatedHeight();
    const isPcVertical = format === 'pc-vertical';

    // 해당 컨테이너의 중복 초기화 방지
    if (containerRef.current.dataset.initialized === 'true') return;

    const script = document.createElement('script');
    script.src = "https://ads-partners.coupang.com/g.js";
    script.async = true;

    script.onload = () => {
      // 컴포넌트가 언마운트되었는지 확인 (Ref가 여전히 존재하고 DOM에 붙어있는지)
      if (!containerRef.current) return;

      if (window.PartnersCoupang) {
        try {
          // 초기화 전에 컨테이너가 DOM에 존재하는지 최후 확인
          if (!document.getElementById(bannerContainerId)) {
            console.warn(`Coupang container ${bannerContainerId} not found in DOM yet.`);
            return;
          }

          new window.PartnersCoupang.G({
            "id": 954727,
            "template": "carousel",
            "trackingCode": "AF0762988",
            "width": isPcVertical ? '160' : '100%',
            "height": isPcVertical ? '600' : `${calculatedHeight}`,
            "tsource": "",
            "container": bannerContainerId
          });
          
          if (containerRef.current) {
            containerRef.current.dataset.initialized = 'true';
          }
        } catch (e) {
          console.error("Coupang Banner Init Error:", e);
        }
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.dataset.initialized = 'false';
      }
    };
  }, [isDev, format, bannerContainerId]);

  const calculatedHeight = getCalculatedHeight();
  const isPcVertical = format === 'pc-vertical';

  if (isDev) {
    if (isPcVertical) {
      return (
        <div className="flex flex-col items-center justify-between py-10 px-2 w-[160px] h-[600px] bg-gray-50 border border-dashed border-gray-300 rounded-lg overflow-hidden">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="bg-gray-200 text-[10px] text-gray-400 px-1 rounded font-sans">쿠팡 AD</span>
            <div>
              <p className="text-sm font-bold text-gray-400">PC 우측 광고</p>
              <p className="text-xs text-gray-400 mt-2">160 x 600</p>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 text-center leading-tight">개발 환경에서는<br/>광고가 노출되지 않습니다</div>
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
      <div 
        id={bannerContainerId}
        ref={containerRef} 
        className={isPcVertical ? 'w-[160px]' : 'w-full'}
      ></div>
    </div>
  );
}
