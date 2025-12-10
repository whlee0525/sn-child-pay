import { CATEGORIES, Category } from '@/data/categories';

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="bg-black/10 backdrop-blur-sm rounded-2xl px-3 py-2">
      <div
        className="category-filter flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
      >
        <style>{`
          .category-filter::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${selectedCategory === category
                ? 'bg-[#004098] text-white shadow-md'
                : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
