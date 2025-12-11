import React from 'react';
// import { AdBanner } from './AdBanner';
import { FooterInfo } from './FooterInfo';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onMinimize?: () => void;
  onBack?: () => void;
  minimized?: boolean;
  dataLoading?: boolean;
  searchBar?: React.ReactNode;
  children: React.ReactNode;
}

export function MobileBottomSheet({
  isOpen, onMinimize, onBack, minimized, dataLoading, searchBar, children
}: MobileBottomSheetProps) {
  return (
    <>
      {/* Sheet */}
      <div
        className={`
          absolute bottom-0 left-0 w-full z-30 bg-white shadow-2xl
          transition-transform duration-300 ease-in-out flex flex-col pointer-events-auto
          rounded-t-[28px]
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          maxHeight: minimized ? 'calc(100px + env(safe-area-inset-bottom))' : '85%',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2">
          <div className="flex-1 mr-2 flex items-center gap-2">
            <h2 className={`truncate ${minimized ? 'text-sm font-medium text-[#004098]' : 'text-base font-bold text-[#004098]'}`}>
              성남시 아동수당 사용처
            </h2>
            {dataLoading && !minimized && (
              <span className="text-xs text-gray-400 whitespace-nowrap">데이터 로딩중</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                aria-label="뒤로"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              onMinimize && (
                <button
                  onClick={onMinimize}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={minimized ? "펼치기" : "최소화"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {minimized ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                </button>
              )
            )}
          </div>
        </div>

        {/* Content - Hidden when minimized */}
        {!minimized && (
          <>
            {/* Search Bar */}
            {searchBar && (
              <div className="px-4 pb-2 shrink-0">
                {searchBar}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="px-4 pb-4 flex-1 overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 shrink-0 space-y-2 bg-white">
              {/* TODO: 광고 승인 후 주석 해제 */}
              {/* <AdBanner /> */}
              <FooterInfo />
            </div>
          </>
        )}
      </div>
    </>
  );
}
