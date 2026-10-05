import React, { useState, useEffect } from 'react';
import { HabitItem, HabitCategory } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Droplets,
  Sparkles,
  BookOpen,
  Activity,
  Backpack,
  Moon,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Trash2,
} from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface TodayTasksViewProps {
  habits: HabitItem[];
  onCompleteHabit: (habitId: string) => void;
  onIncrementCounter: (habitId: string) => void;
  onAddHabit: (newHabit: Omit<HabitItem, 'id' | 'streak' | 'completedToday'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

const CATEGORY_NAMES: Record<HabitCategory, string> = {
  health: 'Sức khỏe',
  study: 'Học tập',
  routine: 'Nề nếp',
  mindfulness: 'Tâm trí',
};

export const TodayTasksView: React.FC<TodayTasksViewProps> = ({
  habits,
  onCompleteHabit,
  onIncrementCounter,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [filterTime, setFilterTime] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New habit form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('routine');
  const [newNote, setNewNote] = useState('');
  const [newTimeOfDay, setNewTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');

  // Study Pomodoro Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sound.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      // Find study habit and complete it if not already
      const studyHabit = habits.find((h) => h.id === 'habit_study' || h.category === 'study');
      if (studyHabit && !studyHabit.completedToday) {
        onCompleteHabit(studyHabit.id);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, habits, onCompleteHabit]);

  const toggleTimer = () => {
    sound.playPop();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    sound.playPop();
    setIsTimerRunning(false);
    setTimerSecondsLeft(25 * 60);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return Droplets;
      case 'Sparkles':
        return Sparkles;
      case 'BookOpen':
        return BookOpen;
      case 'Activity':
        return Activity;
      case 'Backpack':
        return Backpack;
      case 'Moon':
        return Moon;
      case 'Timer':
      default:
        return Timer;
    }
  };

  const filteredHabits = habits.filter((h) => {
    if (filterTime === 'all') return true;
    return h.timeOfDay === filterTime || h.timeOfDay === 'anytime';
  });

  const completedCount = habits.filter((h) => h.completedToday).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      type: 'simple',
      iconName: newCategory === 'health' ? 'Activity' : newCategory === 'study' ? 'BookOpen' : 'Sparkles',
      note: newNote.trim() || undefined,
      timeOfDay: newTimeOfDay,
      expReward: 40,
      seedReward: 20,
      waterDropReward: 10,
    });

    setNewTitle('');
    setNewNote('');
    setShowAddModal(false);
    sound.playPop();
  };

  return (
    <div className="space-y-6">
      {/* Daily Progress Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            Hôm nay bạn đã hoàn thành {completedCount}/{habits.length} việc
          </h2>
          <p className="text-xs text-stone-500">
            {progressPercent === 100
              ? '🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ mục tiêu hôm nay!'
              : 'Từng bước nhỏ vững chắc giúp xây dựng thói quen kiên trì.'}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
          {/* Progress bar */}
          <div className="w-36 h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-emerald-800 tabular-nums">
            {progressPercent}%
          </span>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm việc mới</span>
          </button>
        </div>
      </div>

      {/* Interactive Quick-Feature: Water Intake Tracker & Pomodoro Focus Timer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Cup Tracker */}
        <div className="bg-sky-50/70 rounded-2xl border border-sky-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-600 fill-sky-300" />
              <h3 className="text-sm font-bold text-sky-950 font-serif">
                Uống đủ 2L nước mỗi ngày (8 ly)
              </h3>
            </div>
            {(() => {
              const waterHabit = habits.find((h) => h.id === 'habit_water');
              const count = waterHabit?.currentCount || 0;
              return (
                <span className="text-xs font-bold text-sky-800 bg-white/80 px-2 py-0.5 rounded-lg border border-sky-200 tabular-nums">
                  {count}/8 ly ({(count * 0.25).toFixed(2)}L)
                </span>
              );
            })()}
          </div>

          <p className="text-xs text-sky-800/80">
            Nhấp vào từng chiếc ly khi bạn uống xong 1 cốc nước (250ml) để nạp nước cho Bé Mầm:
          </p>

          {/* 8 cups grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
            {Array.from({ length: 8 }).map((_, idx) => {
              const waterHabit = habits.find((h) => h.id === 'habit_water');
              const count = waterHabit?.currentCount || 0;
              const isFilled = idx < count;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (waterHabit) {
                      sound.playWaterDrop();
                      onIncrementCounter(waterHabit.id);
                      if (idx + 1 === 8) {
                        confetti({ particleCount: 30, spread: 50 });
                      }
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-sky-500 border-sky-600 text-white shadow-xs'
                      : 'bg-white/80 border-sky-200 text-sky-600 hover:bg-sky-100'
                  }`}
                  title={`Ly nước số ${idx + 1}`}
                >
                  <span className="text-lg">{isFilled ? '🥛' : '🥤'}</span>
                  <span className="text-[10px] font-semibold mt-1">Ly {idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pomodoro Focus Study Timer */}
        <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-950 font-serif">
                Học tập tập trung (Pomodoro 25p)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200 tabular-nums">
              {formatTimer(timerSecondsLeft)}
            </span>
          </div>

          <p className="text-xs text-amber-800/80">
            Bật đồng hồ, cất điện thoại và chuyên tâm giải quyết 1 bài tập trong 25 phút:
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                isTimerRunning
                  ? 'bg-stone-700 hover:bg-stone-800 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{timerSecondsLeft < 25 * 60 ? 'Tiếp tục học' : 'Bắt đầu 25 phút'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Đặt lại đồng hồ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'morning', label: 'Buổi sáng' },
            { id: 'afternoon', label: 'Buổi chiều' },
            { id: 'evening', label: 'Buổi tối' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playPop();
                setFilterTime(tab.id as typeof filterTime);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterTime === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {filteredHabits.map((habit) => {
          const Icon = getIcon(habit.iconName);
          const isDone = habit.completedToday;

          return (
            <div
              key={habit.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200/80 opacity-80'
                  : 'bg-white border-stone-200/80 shadow-xs hover:border-emerald-300'
              }`}
            >
              {/* Checkbox trigger & habit content */}
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => {
                    if (!isDone) {
                      sound.playChime();
                      confetti({
                        particleCount: 25,
                        spread: 45,
                        origin: { y: 0.6 },
                      });
                    } else {
                      sound.playPop();
                    }
                    onCompleteHabit(habit.id);
                  }}
                  className="mt-0.5 text-emerald-600 hover:text-emerald-700 transition-transform active:scale-90 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label={isDone ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-stone-300 hover:text-emerald-500" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm sm:text-base font-semibold ${
                        isDone ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {habit.title}
                    </h4>

                    {habit.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-800 tabular-nums">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{habit.streak} ngày</span>
                      </span>
                    )}
                  </div>

                  {habit.note && (
                    <p className="text-xs text-stone-500">{habit.note}</p>
                  )}

                  {/* Rewards and meta */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 pt-0.5">
                    <span className="text-emerald-800 font-medium">
                      {CATEGORY_NAMES[habit.category]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-800 font-semibold tabular-nums">
                      +{habit.seedReward} 🌱
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-800 font-semibold tabular-nums">
                      +{habit.waterDropReward} 💧
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-semibold tabular-nums">
                      +{habit.expReward} EXP
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete action for custom habits */}
              {!['habit_water', 'habit_desk', 'habit_study'].includes(habit.id) && (
                <button
                  onClick={() => {
                    sound.playPop();
                    onDeleteHabit(habit.id);
                  }}
                  className="text-stone-300 hover:text-rose-500 p-2 transition-colors cursor-pointer"
                  title="Xóa thói quen này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Habit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Tạo thói quen nhỏ mới
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tên thói quen (ví dụ: Đọc 5 trang sách, Uống nước sau khi ngủ dậy...)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nhập tên việc cần làm..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nhóm thói quen
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as HabitCategory)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-emerald-600 bg-white"
                >
                  <option value="routine">Nề nếp & gọn gàng</option>
                  <option value="study">Học tập & đọc sách</option>
                  <option value="health">Sức khỏe & vận động</option>
                  <option value="mindfulness">Tâm trí & thư giãn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Thời điểm thực hiện
                </label>
                <select
                  value={newTimeOfDay}
                  onChange={(e) =>
                    setNewTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening' | 'anytime')
                  }
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-emerald-600 bg-white"
                >
                  <option value="anytime">Bất kỳ lúc nào</option>
                  <option value="morning">Buổi sáng</option>
                  <option value="afternoon">Buổi chiều</option>
                  <option value="evening">Buổi tối</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ghi chú nhỏ (tùy chọn)
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Gợi ý mẹo làm nhanh..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Lưu thói quen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
