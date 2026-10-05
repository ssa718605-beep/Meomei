import React, { useRef, useEffect } from 'react';
import { NavTabId, AppState } from '../types';
import {
  User,
  CheckCircle2,
  Dice5,
  Flower2,
  CalendarDays,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  Droplets,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderSlideBarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  state: AppState;
  onToggleSound: () => void;
}

interface TabDef {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | null;
}

export const HeaderSlideBar: React.FC<HeaderSlideBarProps> = ({
  currentTab,
  onSelectTab,
  state,
  onToggleSound,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pending habits count
  const pendingHabits = state.habits.filter((h) => !h.completedToday).length;
  // Has uncompleted daily quest
  const hasPendingQuest = !state.currentRandomQuest.completed;
  // Has harvest ready
  const hasHarvestReady = state.gardenPlots.some((p) => p && p.harvestReady);

  const tabs: TabDef[] = [
    {
      id: 'character',
      label: 'Nhân vật của tôi',
      icon: User,
      badge: `Lv.${state.sprout.level}`,
    },
    {
      id: 'today',
      label: 'Việc hôm nay',
      icon: CheckCircle2,
      badge: pendingHabits > 0 ? pendingHabits : null,
    },
    {
      id: 'random-quest',
      label: 'Nhiệm vụ ngẫu nhiên',
      icon: Dice5,
      badge: hasPendingQuest ? 'Mới' : null,
    },
    {
      id: 'garden',
      label: 'Khu vườn',
      icon: Flower2,
      badge: hasHarvestReady ? '✨' : null,
    },
    {
      id: 'history',
      label: 'Lịch sử hành trình',
      icon: CalendarDays,
    },
    {
      id: 'challenges',
      label: 'Thử thách',
      icon: Trophy,
      badge: `${state.challenges.filter((c) => !c.completed).length}`,
    },
    {
      id: 'collection',
      label: 'Bộ sưu tập',
      icon: Sparkles,
      badge: `${state.collections.filter((c) => c.unlocked).length}/${state.collections.length}`,
    },
  ];

  // Auto-scroll active tab into view when changed
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(
      `[data-tab-id="${currentTab}"]`
    ) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentTab]);

  return (
    <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      {/* Zone 1 & 3: Wordmark & Live Currencies / Status */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xs">
            <span className="text-lg">🌱</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-emerald-950 font-serif leading-tight">
              Mầm Nhỏ
            </h1>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              Nuôi dưỡng thói quen, nảy mầm tương lai
            </p>
          </div>
        </div>

        {/* Currency & Quick Toggles */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Seeds counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-lg border border-amber-200/70 text-xs font-semibold text-amber-900 shadow-xs tabular-nums"
            title="Hạt giống để trồng cây & mở khóa đồ trang trí"
          >
            <span className="text-sm">🌱</span>
            <span>{state.seeds}</span>
          </div>

          {/* Water drops counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-lg border border-sky-200/70 text-xs font-semibold text-sky-900 shadow-xs tabular-nums"
            title="Giọt sương để tưới mát cho Bé Mầm và khu vườn"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-400" />
            <span>{state.waterDrops}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playPop();
            }}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            title={state.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            aria-label="Cài đặt âm thanh"
          >
            {state.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>
        </div>
      </div>

      {/* Slide Bar (Slide bar nằm ở trên là các chức năng) */}
      <div className="border-t border-amber-200/50 bg-stone-50/70">
        <div
          ref={scrollContainerRef}
          className="max-w-6xl mx-auto px-2 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5 scroll-smooth"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => {
                  sound.playPop();
                  onSelectTab(tab.id);
                }}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-emerald-800 hover:bg-emerald-50/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-emerald-600/80'
                  }`}
                />
                <span>{tab.label}</span>

                {/* Badge indicator */}
                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
