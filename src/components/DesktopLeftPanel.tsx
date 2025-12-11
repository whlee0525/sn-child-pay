import React from 'react';
import { AdBanner } from './AdBanner';
import { FooterInfo } from './FooterInfo';

interface DesktopLeftPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onBack?: () => void;
  dataLoading?: boolean;
  searchBar?: React.ReactNode;
  children: React.ReactNode;
}

export function DesktopLeftPanel({
  isVisible, onClose, onBack, dataLoading, searchBar, children
}: DesktopLeftPanelProps) {
  return (
    <>
      <div
        className={`
          absolute top-0 left-0 h-full w-[332px] z-30 bg-white shadow-2xl
          transition-transform duration-300 ease-in-out flex flex-col
          rounded-r-xl pointer-events-auto
          ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2">
        <div className="flex-1 mr-2 flex items-center gap-2">
          <h2 className="text-base font-bold text-[#004098] truncate">
            성남시 아동수당 사용처
          </h2>
          {dataLoading && (
            <span className="text-xs text-gray-400 whitespace-nowrap">데이터 로딩중</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="뒤로"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>


      {/* Search Bar */}
      {searchBar && (
        <div className="px-4 pb-2 shrink-0">
          {searchBar}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="px-4 pb-4 flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Footer */}
      <div className="px-4 pt-[10px] pb-8 border-t border-gray-100 shrink-0 space-y-2 bg-white">
        <FooterInfo />
        {/* 광고 승인 후 주석 해제 */}
        <AdBanner 
          unitId={import.meta.env.VITE_KAKAO_ADFIT_UNIT_ID_PC} 
          format="pc" 
        />
      </div>
    </div>
    </>
  );
}
