import React, { useState } from 'react';
import { CollectionItem } from '../types';
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface CollectionViewProps {
  collections: CollectionItem[];
}

const RARITY_LABELS: Record<CollectionItem['rarity'], { label: string; color: string }> = {
  common: { label: 'Phổ biến', color: 'text-stone-600 bg-stone-100' },
  rare: { label: 'Hiếm', color: 'text-sky-800 bg-sky-100' },
  epic: { label: 'Sử thi', color: 'text-purple-800 bg-purple-100' },
  legendary: { label: 'Huyền thoại', color: 'text-amber-800 bg-amber-100' },
};

export const CollectionView: React.FC<CollectionViewProps> = ({ collections }) => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'character_stage' | 'plant' | 'pet' | 'accessory' | 'badge'
  >('all');

  const filteredItems = collections.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  const totalUnlocked = collections.filter((c) => c.unlocked).length;
  const progressPercent = Math.round((totalUnlocked / collections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Bộ sưu tập kỳ quan
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Ghi dấu từng mốc trưởng thành, các loài cây hiếm, thú cưng nhỏ và huy hiệu danh giá.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-900 tabular-nums">
            {totalUnlocked}/{collections.length} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'character_stage', label: 'Nhân vật & Dạng tiến hóa' },
          { id: 'plant', label: 'Cây hoa trong vườn' },
          { id: 'pet', label: 'Thú cưng đồng hành' },
          { id: 'accessory', label: 'Trang phục & Phụ kiện' },
          { id: 'badge', label: 'Huy hiệu thành tựu' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playPop();
              setActiveCategory(tab.id as typeof activeCategory);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-stone-200/80 text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const rarity = RARITY_LABELS[item.rarity];

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                item.unlocked
                  ? 'bg-white border-stone-200/80 shadow-xs hover:border-emerald-300'
                  : 'bg-stone-50/60 border-stone-200 opacity-60'
              }`}
            >
              {/* Item Top: Icon and Rarity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rarity.color}`}
                  >
                    {rarity.label}
                  </span>

                  {item.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                {/* Big Visual Icon */}
                <div className="py-2 flex items-center justify-center">
                  <span
                    className={`text-4xl sm:text-5xl transition-transform ${
                      item.unlocked ? 'hover:scale-110' : 'grayscale opacity-50'
                    }`}
                  >
                    {item.icon}
                  </span>
                </div>

                <div className="text-center mt-2 space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Unlock Status */}
              <div className="pt-3 border-t border-stone-100 mt-3 text-center">
                {item.unlocked ? (
                  <span className="text-[10px] font-medium text-emerald-800">
                    {item.unlockedAt ? `Mở khóa ${item.unlockedAt}` : 'Đã mở khóa'}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-stone-400 italic">
                    Chưa mở khóa
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
