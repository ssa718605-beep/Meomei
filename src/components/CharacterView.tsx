import React, { useState } from 'react';
import { AppState, SproutCharacter } from '../types';
import { SproutAvatar } from './SproutAvatar';
import { Droplets, Sun, Heart, Sparkles, Shirt, Award, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CharacterViewProps {
  state: AppState;
  onUpdateSprout: (updater: (sprout: SproutCharacter) => SproutCharacter) => void;
  onSpendDrops: (amount: number) => boolean;
  onAddExp: (exp: number) => void;
}

const QUOTES = [
  '“Hôm nay bạn đã làm rất tốt, cùng tiếp tục kiên trì nhé!”',
  '“Một việc nhỏ làm đều đặn mỗi ngày sẽ nở thành bông hoa rực rỡ.”',
  '“Uống một ngụm nước và hít thở thật sâu nào bạn ơi!”',
  '“Bàn học sạch sẽ là khởi đầu của một tâm trí sáng suốt.”',
  '“Đừng sợ đi chậm, chỉ sợ đứng yên một chỗ.”',
];

export const CharacterView: React.FC<CharacterViewProps> = ({
  state,
  onUpdateSprout,
  onSpendDrops,
  onAddExp,
}) => {
  const { sprout } = state;
  const [isWatering, setIsWatering] = useState(false);
  const [isSunbathing, setIsSunbathing] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(sprout.name);

  // Care actions
  const handleWater = () => {
    if (state.waterDrops < 5) {
      alert('Bạn cần ít nhất 5 giọt sương để tưới cho Bé Mầm! Hãy uống nước hoặc hoàn thành nhiệm vụ để kiếm thêm nhé.');
      return;
    }
    if (onSpendDrops(5)) {
      sound.playWaterDrop();
      setIsWatering(true);
      onUpdateSprout((prev) => ({
        ...prev,
        waterLevel: Math.min(100, prev.waterLevel + 15),
        mood: 'excited',
      }));
      onAddExp(15);
      setTimeout(() => setIsWatering(false), 2000);
    }
  };

  const handleSunbath = () => {
    sound.playChime();
    setIsSunbathing(true);
    onUpdateSprout((prev) => ({
      ...prev,
      sunLevel: Math.min(100, prev.sunLevel + 15),
      mood: 'happy',
    }));
    onAddExp(10);
    setTimeout(() => setIsSunbathing(false), 2000);
  };

  const handlePet = () => {
    onUpdateSprout((prev) => ({
      ...prev,
      loveLevel: Math.min(100, prev.loveLevel + 10),
      mood: 'excited',
    }));
    onAddExp(5);
  };

  const handleEquipHat = (hatId: string) => {
    sound.playPop();
    onUpdateSprout((prev) => ({
      ...prev,
      equippedHat: prev.equippedHat === hatId ? undefined : hatId,
    }));
  };

  const handleEquipAcc = (accId: string) => {
    sound.playPop();
    onUpdateSprout((prev) => ({
      ...prev,
      equippedAccessory: prev.equippedAccessory === accId ? undefined : accId,
    }));
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateSprout((prev) => ({ ...prev, name: tempName.trim() }));
      setEditingName(false);
      sound.playPop();
    }
  };

  // Evolution stages display
  const getStageTitle = (lvl: number) => {
    if (lvl < 2) return 'Hạt Mầm Ngái Ngủ';
    if (lvl < 5) return 'Mầm Xanh Tò Mò';
    if (lvl < 8) return 'Bé Chồi Tràn Năng Lượng';
    if (lvl < 12) return 'Cây Non Tự Tin';
    return 'Thụ Thần Hoàng Kim';
  };

  const expPercentage = Math.min(100, Math.round((sprout.exp / sprout.expNeeded) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Pet Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative leaf backdrop */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Avatar Graphic with interactive click */}
          <div className="flex flex-col items-center">
            <SproutAvatar
              sprout={sprout}
              size="lg"
              interactive
              onPet={handlePet}
              isWatering={isWatering}
              isSunbathing={isSunbathing}
            />
            <p className="mt-2 text-xs text-stone-500 font-medium">
              Chạm vào Bé Mầm để vỗ về (+EXP) ✨
            </p>
          </div>

          {/* Character Details & Vitals */}
          <div className="flex-1 w-full space-y-4">
            {/* Header: Name, Stage & Level */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                {editingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={18}
                      className="px-2 py-1 text-lg font-bold text-stone-900 border border-emerald-400 rounded-lg focus:outline-emerald-600"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                    >
                      Lưu
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                      {sprout.name}
                    </h2>
                    <button
                      onClick={() => {
                        setTempName(sprout.name);
                        setEditingName(true);
                      }}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Đổi tên
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                  <span className="font-semibold text-emerald-800">
                    {getStageTitle(sprout.level)}
                  </span>
                  <span>·</span>
                  <span>Cấp độ {sprout.level}</span>
                </div>
              </div>

              {/* Level Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Level {sprout.level}</span>
              </div>
            </div>

            {/* EXP Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-stone-600 tabular-nums">
                <span>Điểm trưởng thành (EXP)</span>
                <span>
                  {sprout.exp} / {sprout.expNeeded} EXP ({expPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Hoàn thành thói quen mỗi ngày để nhận EXP giúp Bé Mầm lớn nhanh!
              </p>
            </div>

            {/* Vitals Progress: Water, Sun, Love */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              {/* Water */}
              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-xs font-semibold text-sky-800 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-400" />
                  <span>Độ ẩm</span>
                </div>
                <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${sprout.waterLevel}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-sky-900 mt-1 tabular-nums">
                  {sprout.waterLevel}%
                </span>
              </div>

              {/* Sun */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-800 mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Nắng ấm</span>
                </div>
                <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${sprout.sunLevel}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-amber-900 mt-1 tabular-nums">
                  {sprout.sunLevel}%
                </span>
              </div>

              {/* Love */}
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-800 mb-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                  <span>Gắn bó</span>
                </div>
                <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${sprout.loveLevel}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-rose-900 mt-1 tabular-nums">
                  {sprout.loveLevel}%
                </span>
              </div>
            </div>

            {/* Quick Care Actions Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleWater}
                className="flex-1 min-h-[42px] px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Droplets className="w-4 h-4 fill-sky-200" />
                <span>Tưới nước (-5 💧)</span>
              </button>

              <button
                onClick={handleSunbath}
                className="flex-1 min-h-[42px] px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Sun className="w-4 h-4 fill-amber-200" />
                <span>Tắm nắng (+EXP)</span>
              </button>

              <button
                onClick={handlePet}
                className="flex-1 min-h-[42px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-emerald-200" />
                <span>Xoa đầu Bé Mầm</span>
              </button>
            </div>
          </div>
        </div>

        {/* Motivational speech bubble */}
        <div className="mt-5 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between gap-3 text-xs sm:text-sm text-stone-700">
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <span className="italic font-medium">{QUOTES[quoteIndex]}</span>
          </div>
          <button
            onClick={() => {
              setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
              sound.playPop();
            }}
            className="text-stone-400 hover:text-stone-700 p-1"
            title="Lời nhắn khác"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Wardrobe & Accessories */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-stone-900 font-serif">
              Tủ đồ của Bé Mầm
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            Mở khóa thêm đồ bằng cách hoàn thành Thử thách
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Straw Hat */}
          <div
            onClick={() => handleEquipHat('hat_straw')}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              sprout.equippedHat === 'hat_straw'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                : 'border-stone-200 hover:border-emerald-300'
            }`}
          >
            <span className="text-2xl block mb-1">👒</span>
            <p className="text-xs font-bold text-stone-800">Nón Rơm Mầm Xinh</p>
            <span className="text-[10px] text-stone-500">
              {sprout.equippedHat === 'hat_straw' ? 'Đang đội' : 'Nhấn để đội'}
            </span>
          </div>

          {/* Scholar Glasses */}
          <div
            onClick={() => handleEquipHat('hat_glasses')}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              sprout.equippedHat === 'hat_glasses'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                : 'border-stone-200 hover:border-emerald-300'
            }`}
          >
            <span className="text-2xl block mb-1">👓</span>
            <p className="text-xs font-bold text-stone-800">Kính Trí Thức</p>
            <span className="text-[10px] text-stone-500">
              {sprout.equippedHat === 'hat_glasses' ? 'Đang đeo' : 'Nhấn để đeo'}
            </span>
          </div>

          {/* Flower Bow */}
          <div
            onClick={() => handleEquipAcc('acc_flower_bow')}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              sprout.equippedAccessory === 'acc_flower_bow'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                : 'border-stone-200 hover:border-emerald-300'
            }`}
          >
            <span className="text-2xl block mb-1">🌸</span>
            <p className="text-xs font-bold text-stone-800">Nơ Hoa Tươi Tắn</p>
            <span className="text-[10px] text-stone-500">
              {sprout.equippedAccessory === 'acc_flower_bow' ? 'Đang cài' : 'Nhấn để cài'}
            </span>
          </div>

          {/* Nightcap */}
          <div
            onClick={() => handleEquipHat('hat_nightcap')}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              sprout.equippedHat === 'hat_nightcap'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                : 'border-stone-200 hover:border-emerald-300'
            }`}
          >
            <span className="text-2xl block mb-1">🌙</span>
            <p className="text-xs font-bold text-stone-800">Mũ Ngủ Trăng Sao</p>
            <span className="text-[10px] text-stone-500">
              {sprout.equippedHat === 'hat_nightcap' ? 'Đang đội' : 'Nhấn để đội'}
            </span>
          </div>
        </div>
      </div>

      {/* Evolution Journey Milestones */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900 font-serif">
            Hành trình tiến hóa của Mầm Nhỏ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { lvl: 1, name: 'Hạt Mầm Ngái Ngủ', icon: '🌰', req: 'Level 1' },
            { lvl: 3, name: 'Mầm Xanh Tò Mò', icon: '🌱', req: 'Level 3' },
            { lvl: 5, name: 'Bé Chồi Năng Động', icon: '🌿', req: 'Level 5' },
            { lvl: 8, name: 'Cây Non Tự Tin', icon: '🪴', req: 'Level 8' },
            { lvl: 12, name: 'Thụ Thần Hoàng Kim', icon: '🌳', req: 'Level 12' },
          ].map((stage) => {
            const isUnlocked = sprout.level >= stage.lvl;
            const isCurrent =
              sprout.level >= stage.lvl &&
              (stage.lvl === 12 || sprout.level < (stage.lvl === 1 ? 3 : stage.lvl === 3 ? 5 : stage.lvl === 5 ? 8 : 12));

            return (
              <div
                key={stage.lvl}
                className={`p-3 rounded-xl border flex flex-col items-center text-center ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400/30'
                    : isUnlocked
                    ? 'border-stone-200 bg-white'
                    : 'border-stone-200 bg-stone-50/60 opacity-60'
                }`}
              >
                <span className="text-3xl mb-1">{stage.icon}</span>
                <p className="text-xs font-bold text-stone-800 leading-tight">
                  {stage.name}
                </p>
                <span className="text-[10px] text-stone-500 mt-1">
                  {isUnlocked ? (isCurrent ? '⭐ Hiện tại' : '✓ Đã đạt') : stage.req}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
