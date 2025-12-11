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
         ins.setAttribute('data-ad-width', '320');
         ins.setAttribute('data-ad-height', '100');
      } else if (isPcVertical) {
         ins.setAttribute('data-ad-width', '160');
         ins.setAttribute('data-ad-height', '600');
      } else {
         ins.setAttribute('data-ad-width', 'responsive');
         ins.setAttribute('data-ad-height', '50'); // Mobile standard height
         // responsive일 경우 height auto가 일반적이나, 
         // Kakao AdFit 가이드에 따라 width=responsive시 height는 보통 auto/50/100 등 설정
         // 여기서는 width만 responsive로 하고, CSS로 잡히는지 확인 필요하지만
         // 보통 data-ad-width="responsive" 쓰면 data-ad-height는 무시되거나 auto여야 함.
         // 하지만 기존 코드 data-ad-height="auto" 였음.
         // 명시적으로 반응형 width일때 height 설정.
         ins.setAttribute('data-ad-height', 'auto');
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
            <div className="w-[320px] h-[100px] mx-auto bg-gray-50 border border-gray-200 flex flex-row items-center justify-between px-4 rounded-lg overflow-hidden">
                <div className="flex flex-col gap-1">
                    <span className="w-fit bg-gray-200 text-xs text-gray-500 px-2 py-0.5 rounded">AD (320x100)</span>
                    <p className="font-bold text-gray-700 text-sm">성남시 아동수당<br/>사용처 찾기</p>
                </div>
                <button className="px-4 py-2 bg-[#004098] text-white text-sm font-bold rounded hover:bg-[#003377] transition-colors">
                    보기
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
            isPc ? 'w-[320px] h-[100px]' : 
            isPcVertical ? 'w-[160px] h-[600px]' : 
            'w-full'
        } 
      />
    </div>
  );
}

