import { useEffect, useRef } from 'react';

interface StoreListViewProps {
  stores: Array<{
    id: number;
    n: string;
    c: string;
    a: string;
  }>;
  onSelectStore: (store: { id: number; n: string; c: string; a: string }) => void;
  scrollPositionRef?: React.MutableRefObject<number>; // For scroll preservation
}

// Category color mapping (same as StoreDetailView)
const getCategoryColor = (category: string): string => {
  if (category.includes('제과') || category.includes('빵')) return 'bg-orange-100 text-orange-600';
  if (category.includes('병원') || category.includes('의료')) return 'bg-red-100 text-red-600';
  if (category.includes('학원') || category.includes('교육')) return 'bg-blue-100 text-blue-600';
  if (category.includes('마트') || category.includes('슈퍼')) return 'bg-green-100 text-green-600';
  if (category.includes('음식') || category.includes('식당')) return 'bg-yellow-100 text-yellow-600';
  return 'bg-gray-100 text-gray-600';
};

export function StoreListView({ stores, onSelectStore, scrollPositionRef }: StoreListViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollContainerRef.current && scrollPositionRef?.current) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  // Save scroll position on scroll
  const handleScroll = () => {
    if (scrollContainerRef.current && scrollPositionRef) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="space-y-2"
      >
        {stores.map((store) => (
          <button
            key={store.id}
            onClick={() => onSelectStore(store)}
            className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${getCategoryColor(store.c)}`}>
                {store.c}
              </span>
              <h3 className="font-bold text-sm text-gray-800 leading-tight">{store.n}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{store.a}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
