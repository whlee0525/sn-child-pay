import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
  selectedCategory?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '검색...',
  resultCount,
  totalCount,
  selectedCategory = '전체',
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="mb-4">
      {/* Search Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#004098] focus-within:bg-white transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Info text */}
      {(resultCount !== undefined || totalCount !== undefined) && (
        <p className="text-[10px] text-gray-500 mt-2 px-1">
          {value && resultCount !== undefined ? (
            <span className="text-[#004098] font-semibold">
              {selectedCategory !== '전체' ? `'${selectedCategory}' 중 ` : ''}검색결과 {resultCount.toLocaleString()}곳
            </span>
          ) : totalCount !== undefined ? (
            selectedCategory !== '전체' ? (
              <span className="text-[#004098] font-semibold">'{selectedCategory}' {totalCount.toLocaleString()}곳</span>
            ) : (
              <span>전체 {totalCount.toLocaleString()}곳</span>
            )
          ) : null}
        </p>
      )}
    </div>
  );
}
