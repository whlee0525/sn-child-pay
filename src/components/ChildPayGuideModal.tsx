interface ChildPayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChildPayGuideModal({ isOpen, onClose }: ChildPayGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#004098]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            성남시 아동수당 종합 안내
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-base font-bold text-[#004098] mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#004098] rounded-full"></span>
              지급 대상 및 금액
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>대상:</strong> 성남시에 거주하는 만 8세 미만의 아동</li>
              <li><strong>금액:</strong> 아동 1명당 매월 12만원</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-bold text-[#004098] mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#004098] rounded-full"></span>
              지역화폐(모바일/카드) 사용 안내
            </h3>
            <p className="text-sm">
              성남시 아동수당은 <strong>성남사랑상품권(모바일 또는 카드)</strong>으로 지급되며, 성남시 내 가맹점에서 편리하게 사용하실 수 있습니다.
            </p>
          </section>

          <section>
            <h3 className="text-base font-bold text-[#004098] mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#004098] rounded-full"></span>
              사용 제한 업종 (유의사항)
            </h3>
            <p className="text-sm mb-2">다음의 경우에는 사용이 제한될 수 있습니다:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-600 font-medium">
              <li>대형마트 및 백화점</li>
              <li>유흥주점 및 사행성 업소</li>
              <li>대규모 점포 및 기업형 슈퍼마켓(SSM)</li>
              <li>성남시에 본사를 두지 않은 프랜차이즈 직영점</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-bold text-[#004098] mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#004098] rounded-full"></span>
              신청 방법
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>온라인:</strong> 복지로 홈페이지(bokjiro.go.kr) 또는 정부24</li>
              <li><strong>방문:</strong> 관할 동 행정복지센터 방문 신청</li>
            </ul>
          </section>

          <div className="pt-6 mt-6 border-t border-gray-100 space-y-2 text-[11px] text-gray-400">
            <p className="flex items-center gap-1.5">
              <span>📊</span> 
              <span><strong>데이터 출처:</strong> 신한카드 2025년 6월 자료 (매년 업데이트 예정)</span>
            </p>
            <p className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
              <span><strong>개발/광고 문의:</strong> <a href="mailto:whlee0525@gmail.com" className="text-blue-500 hover:underline">whlee0525@gmail.com</a></span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
