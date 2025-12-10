interface StoreDetailProps {
  name: string;
  category: string;
  address: string;
}

// Category color mapping
const getCategoryColor = (category: string): string => {
  if (category.includes('제과') || category.includes('빵')) return 'bg-orange-100 text-orange-600';
  if (category.includes('병원') || category.includes('의료')) return 'bg-red-100 text-red-600';
  if (category.includes('학원') || category.includes('교육')) return 'bg-blue-100 text-blue-600';
  if (category.includes('마트') || category.includes('슈퍼')) return 'bg-green-100 text-green-600';
  if (category.includes('음식') || category.includes('식당')) return 'bg-yellow-100 text-yellow-600';
  return 'bg-gray-100 text-gray-600';
};

export function StoreDetailView({ name, category, address }: StoreDetailProps) {
  return (
    <div>
      {/* Store Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{name}</h3>

      {/* Store Info */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCategoryColor(category)}`}>
          {category}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{address}</p>
    </div>
  );
}
