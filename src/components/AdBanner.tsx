import { useEffect, useRef } from 'react';

interface AdBannerProps {
  unitId?: string;
  format?: 'mobile' | 'pc' | 'pc-vertical'; // mobile: responsive, pc: 320x100, pc-vertical: 160x600
}

export function AdBanner({ unitId, format = 'mobile' }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isPc = format === 'pc';
  const isPcVertical = format === 'pc-vertical';

  useEffect(() => {
    // 개발 모드이거나 광고 ID가 없으면 더미 광고 표시
    if (!unitId || import.meta.env.DEV) {
      return;
    }

    // Kakao AdFit 스크립트 동적 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://t1.daumcdn.net/kas/static/ba.min.js`;
    script.setAttribute('charset', 'utf-8');

    if (adContainerRef.current) {
      // 기존 내용 클리어 (안전장치)
      adContainerRef.current.innerHTML = '';
      
      // ins 태그 생성
      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'block'; // none이면 스크립트가 로드 안됨
      ins.setAttribute('data-ad-unit', unitId);
      
      if (isPc) {
         ins.setAttribute('data-ad-width', '300');
         ins.setAttribute('data-ad-height', '250');
      } else if (isPcVertical) {
         ins.setAttribute('data-ad-width', '160');
         ins.setAttribute('data-ad-height', '600');
      } else {
         ins.setAttribute('data-ad-width', 'responsive');
         ins.setAttribute('data-ad-height', '50'); // Mobile standard height
      }

      adContainerRef.current.appendChild(ins);
      adContainerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [unitId, isPc, isPcVertical]);

  // 개발 모드 또는 광고 ID 없을 때 더미 광고
  if (!unitId || import.meta.env.DEV) {
    if (isPcVertical) {
        return (
            <div className="w-[160px] h-[600px] bg-gray-50 border border-gray-200 flex flex-col items-center justify-between py-4 px-2 rounded-lg overflow-hidden">
                <div className="flex flex-col items-center gap-4 text-center mt-10">
                    <span className="bg-gray-200 text-xs text-gray-500 px-2 py-0.5 rounded">AD</span>
                    <div>
                      <p className="font-bold text-gray-700 text-lg mb-2">성남시<br/>아동수당</p>
                      <p className="text-gray-500 text-sm">사용처<br/>한눈에<br/>확인하세요</p>
                    </div>
                </div>
                <button className="w-full px-3 py-2 bg-[#004098] text-white text-sm font-bold rounded hover:bg-[#003377] transition-colors mb-4">
                    바로가기
                </button>
            </div>
        );
    }

    if (isPc) {
        return (
            <div className="w-[300px] h-[250px] mx-auto bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-4 text-center rounded-lg overflow-hidden">
                <span className="bg-gray-200 text-xs text-gray-500 px-2 py-0.5 rounded mb-2">AD (300x250)</span>
                <p className="font-bold text-gray-700 text-lg mb-1">성남시 아동수당</p>
                <p className="text-gray-500 text-sm mb-4">우리 아이를 위한 혜택<br/>놓치지 마세요!</p>
                <button className="px-4 py-2 bg-[#004098] text-white text-sm font-bold rounded-lg hover:bg-[#003377] transition-colors">
                    자세히 보기
                </button>
            </div>
        );
    }

    return (
      <div className="h-[50px] w-full bg-gray-50 border border-gray-200 flex items-center justify-between px-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="bg-gray-200 text-[10px] text-gray-500 px-1 rounded">AD</span>
          <div className="flex flex-col justify-center">
             <p className="text-xs font-bold text-gray-700 leading-tight">성남사랑상품권 10% 혜택</p>
          </div>
        </div>
        <button className="px-2 py-1 bg-[#004098] text-white text-[10px] font-bold rounded hover:bg-[#003377] transition-colors whitespace-nowrap">
          보기
        </button>
      </div>
    );
  }

  // 실제 광고 컨테이너
  return (
    <div className={`flex justify-center overflow-hidden ${isPc || isPcVertical ? 'py-4' : 'w-full'}`}>
      <div 
        ref={adContainerRef} 
        className={
            isPc ? 'w-[300px] h-[250px]' : 
            isPcVertical ? 'w-[160px] h-[600px]' : 
            'w-full min-h-[50px]'
        } 
      />
    </div>
  );
}

