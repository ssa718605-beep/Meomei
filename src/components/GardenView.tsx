import React, { useState } from 'react';
import { GardenPlant, GardenDecoration, AppState } from '../types';
import { Flower2, Droplets, Sparkles, Store, Shovel, Check } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface GardenViewProps {
  state: AppState;
  onPlantSeed: (plotIndex: number, plantType: string, name: string, costSeeds: number, waterNeeded: number, yieldSeeds: number, color: string) => boolean;
  onWaterPlant: (plotIndex: number) => boolean;
  onHarvestPlant: (plotIndex: number) => void;
  onBuyDecoration: (decoId: string) => boolean;
}

const SEED_CATALOG = [
  {
    type: 'plant_clover',
    name: 'Cỏ Ba Lá May Mắn',
    icon: '☘️',
    cost: 20,
    waterNeeded: 2,
    yield: 40,
    color: '#4CAF50',
    desc: 'Dễ trồng, thu hoạch nhanh, đem lại may mắn.',
  },
  {
    type: 'plant_sunflower',
    name: 'Hoa Hướng Dương Rực Rỡ',
    icon: '🌻',
    cost: 35,
    waterNeeded: 3,
    yield: 75,
    color: '#FFB300',
    desc: 'Luôn hướng về mặt trời với tinh thần lạc quan.',
  },
  {
    type: 'plant_cactus',
    name: 'Xương Rồng Kiên Cường',
    icon: '🌵',
    cost: 25,
    waterNeeded: 2,
    yield: 50,
    color: '#2E7D32',
    desc: 'Chịu hạn giỏi, biểu tượng của sự kiên trì vượt khó.',
  },
  {
    type: 'plant_lotus',
    name: 'Hoa Sen An Nhiên',
    icon: '🪷',
    cost: 60,
    waterNeeded: 4,
    yield: 130,
    color: '#EC407A',
    desc: 'Hoa sen thanh khiết mang lại sự tĩnh tại cho góc học tập.',
  },
  {
    type: 'plant_magic_bean',
    name: 'Cây Đậu Thần Vươn Cao',
    icon: '🎋',
    cost: 90,
    waterNeeded: 5,
    yield: 210,
    color: '#00897B',
    desc: 'Cây leo thần kỳ vươn tới những ước mơ lớn.',
  },
];

export const GardenView: React.FC<GardenViewProps> = ({
  state,
  onPlantSeed,
  onWaterPlant,
  onHarvestPlant,
  onBuyDecoration,
}) => {
  const [activeTab, setActiveTab] = useState<'garden' | 'shop'>('garden');
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);

  const handleSelectSeed = (seed: typeof SEED_CATALOG[0]) => {
    if (selectedPlot === null) return;
    if (state.seeds < seed.cost) {
      alert(`Bạn cần ${seed.cost} hạt giống để gieo hạt này. Hãy hoàn thành thói quen để kiếm thêm nhé!`);
      return;
    }

    const success = onPlantSeed(
      selectedPlot,
      seed.type,
      seed.name,
      seed.cost,
      seed.waterNeeded,
      seed.yield,
      seed.color
    );

    if (success) {
      sound.playWaterDrop();
      setSelectedPlot(null);
    }
  };

  const handleWater = (plotIndex: number) => {
    if (state.waterDrops < 5) {
      alert('Bạn cần ít nhất 5 giọt sương để tưới cây! Hãy uống nước hoặc hoàn thành nhiệm vụ nhé.');
      return;
    }
    const success = onWaterPlant(plotIndex);
    if (success) {
      sound.playWaterDrop();
    }
  };

  const handleHarvest = (plotIndex: number) => {
    sound.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onHarvestPlant(plotIndex);
  };

  return (
    <div className="space-y-6">
      {/* Garden Overview Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Khu vườn kỳ diệu của Mầm Nhỏ
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Gieo hạt giống tích lũy từ thói quen, tưới nước mỗi ngày và thu hoạch hoa thơm.
          </p>
        </div>

        {/* Tab switch between garden and store */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('garden');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'garden'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Flower2 className="w-4 h-4 text-emerald-600" />
            <span>Vườn cây</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('shop');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-4 h-4 text-amber-700" />
            <span>Tiệm trang trí</span>
          </button>
        </div>
      </div>

      {activeTab === 'garden' ? (
        <div className="space-y-6">
          {/* Garden Landscape Area */}
          <div className="bg-gradient-to-b from-sky-100/60 via-amber-50/50 to-emerald-100/70 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 relative overflow-hidden shadow-inner">
            {/* Scenery Decorations displayed */}
            <div className="flex items-center justify-between pb-6 border-b border-emerald-200/60 text-xs text-stone-600">
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-800">Đồ trang trí trong vườn:</span>
                {state.decorations
                  .filter((d) => d.owned)
                  .map((d) => (
                    <span
                      key={d.id}
                      className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 shadow-xs flex items-center gap-1 font-semibold text-stone-700"
                    >
                      <span>{d.icon}</span>
                      <span>{d.name}</span>
                    </span>
                  ))}
              </div>
              <span className="text-[11px] text-emerald-800 hidden sm:block">
                🌾 Gió nhẹ lay cành lá
              </span>
            </div>

            {/* 6 Garden Plots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-6">
              {state.gardenPlots.map((plot, idx) => {
                if (!plot) {
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        sound.playPop();
                        setSelectedPlot(idx);
                      }}
                      className="min-h-[170px] bg-stone-100/80 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-emerald-50/50 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-stone-200 group-hover:bg-emerald-200/60 flex items-center justify-center text-stone-400 group-hover:text-emerald-700 transition-colors mb-2">
                        <Shovel className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-stone-700 group-hover:text-emerald-800">
                        Ô đất trống #{idx + 1}
                      </p>
                      <span className="text-[11px] text-stone-500 mt-0.5">
                        Nhấn để gieo hạt giống
                      </span>
                    </div>
                  );
                }

                // Planted plot
                return (
                  <div
                    key={plot.id}
                    className="min-h-[170px] bg-white/95 rounded-2xl border border-stone-200 p-4 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden"
                  >
                    {/* Top Plot info */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800 truncate pr-1">
                        {plot.name}
                      </span>
                      {plot.harvestReady ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full animate-pulse">
                          ✨ Nở rộ
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500">
                          {plot.stage === 'seed'
                            ? 'Mới gieo'
                            : plot.stage === 'sprout'
                            ? 'Đang nhú'
                            : 'Đang lớn'}
                        </span>
                      )}
                    </div>

                    {/* Visual Plant Drawing / Icon */}
                    <div className="py-2 flex flex-col items-center justify-center">
                      <span className="text-4xl transition-transform hover:scale-110">
                        {plot.stage === 'seed'
                          ? '🌰'
                          : plot.stage === 'sprout'
                          ? '🌱'
                          : plot.stage === 'growing'
                          ? '🌿'
                          : plot.plantType === 'plant_sunflower'
                          ? '🌻'
                          : plot.plantType === 'plant_lotus'
                          ? '🪷'
                          : plot.plantType === 'plant_cactus'
                          ? '🌵'
                          : plot.plantType === 'plant_magic_bean'
                          ? '🎋'
                          : '☘️'}
                      </span>

                      {/* Water progress bar */}
                      <div className="w-full mt-3 space-y-1">
                        <div className="flex justify-between text-[10px] text-stone-500 font-medium tabular-nums">
                          <span>Nước tưới</span>
                          <span>
                            {plot.waterCount}/{plot.waterNeeded} lần
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (plot.waterCount / plot.waterNeeded) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {plot.harvestReady ? (
                      <button
                        onClick={() => handleHarvest(idx)}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Thu hoạch (+{plot.yieldSeeds} 🌱)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleWater(idx)}
                        className="w-full py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-400" />
                        <span>Tưới nước (-5 💧)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seed Selection Modal if a plot is chosen */}
          {selectedPlot !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-lg w-full shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    Chọn hạt giống cho Ô đất #{selectedPlot + 1}
                  </h3>
                  <button
                    onClick={() => setSelectedPlot(null)}
                    className="text-stone-400 hover:text-stone-600 text-xs font-semibold px-2 py-1"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {SEED_CATALOG.map((seed) => {
                    const canAfford = state.seeds >= seed.cost;

                    return (
                      <div
                        key={seed.type}
                        className="p-3 rounded-xl border border-stone-200 hover:border-emerald-300 flex items-center justify-between gap-3 bg-stone-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{seed.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-stone-900">{seed.name}</p>
                            <p className="text-xs text-stone-500">{seed.desc}</p>
                            <div className="flex items-center gap-2 text-[11px] text-stone-600 mt-0.5">
                              <span>Cần {seed.waterNeeded} lần tưới</span>
                              <span>·</span>
                              <span className="text-amber-800 font-bold">
                                Thu hoạch: +{seed.yield} 🌱
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectSeed(seed)}
                          disabled={!canAfford}
                          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          Gieo ({seed.cost} 🌱)
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Store / Decorations Tab */
        <div className="space-y-4">
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 text-xs text-amber-950 flex items-center justify-between">
            <span>
              💡 Dùng hạt giống bạn thu được từ thói quen để mua sắm vật phẩm trang trí khu vườn.
            </span>
            <span className="font-bold tabular-nums">
              Bạn có: {state.seeds} 🌱
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.decorations.map((deco) => {
              const canAfford = state.seeds >= deco.costSeeds;

              return (
                <div
                  key={deco.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl p-2 bg-stone-50 rounded-xl border border-stone-100">
                      {deco.icon}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-900">{deco.name}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {deco.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 tabular-nums">
                      {deco.costSeeds} 🌱 Hạt
                    </span>

                    {deco.owned ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã sở hữu</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            sound.playChime();
                            confetti({ particleCount: 30, spread: 50 });
                            onBuyDecoration(deco.id);
                          } else {
                            alert('Bạn chưa đủ hạt giống! Hãy hoàn thành thêm thói quen nhé.');
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        Mua trang trí
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
