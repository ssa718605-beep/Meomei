import React, { useState } from 'react';
import { HistoryEntry, DailyReflection, AppState } from '../types';
import { CalendarDays, Flame, Sparkles, CheckCircle2, HeartHandshake, Smile, Coffee, SunMedium } from 'lucide-react';
import { sound } from '../utils/audio';

interface HistoryViewProps {
  state: AppState;
  onSaveReflection: (date: string, note: string, mood: DailyReflection['mood']) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state, onSaveReflection }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const currentReflection = state.reflections[selectedDate] || {
    date: selectedDate,
    note: '',
    mood: 'proud',
  };

  const [noteText, setNoteText] = useState(currentReflection.note);
  const [mood, setMood] = useState<DailyReflection['mood']>(currentReflection.mood);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter history entries for selected date
  const dayEntries = state.history.filter((entry) => entry.date === selectedDate);

  // Generate 28-day activity grid (past 4 weeks)
  const daysGrid = Array.from({ length: 28 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - idx));
    const dStr = d.toISOString().slice(0, 10);
    const count = state.history.filter((h) => h.date === dStr).length;
    return {
      date: dStr,
      dayNum: d.getDate(),
      dayName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      count,
    };
  });

  const totalActions = state.history.length;
  const totalSeedsFromHistory = state.history.reduce((acc, curr) => acc + (curr.seedsGained || 0), 0);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();
    onSaveReflection(selectedDate, noteText, mood);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Streak Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Chuỗi kiên trì hiện tại</p>
            <p className="text-2xl font-bold text-stone-900 font-serif tabular-nums">
              4 ngày liên tục
            </p>
          </div>
        </div>

        {/* Total Tasks Done */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Tổng việc tốt đã làm</p>
            <p className="text-2xl font-bold text-stone-900 font-serif tabular-nums">
              {totalActions} lượt
            </p>
          </div>
        </div>

        {/* Total Seeds Earned */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
            <Sparkles className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Hạt mầm đã tích lũy</p>
            <p className="text-2xl font-bold text-stone-900 font-serif tabular-nums">
              +{totalSeedsFromHistory} 🌱
            </p>
          </div>
        </div>
      </div>

      {/* 28-day Activity Heatmap Calendar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <span>Bản đồ kiên trì 28 ngày qua</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Nhấp vào một ngày để xem lại chi tiết việc bạn đã hoàn thành và viết nhật ký.
            </p>
          </div>

          {/* Color intensity legend */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>Ít</span>
            <div className="w-3.5 h-3.5 rounded bg-stone-100 border border-stone-200" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-200" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-400" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-600" />
            <span>Nhiều</span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {daysGrid.map((item) => {
            const isSelected = item.date === selectedDate;
            const isToday = item.date === todayStr;

            let bgClass = 'bg-stone-100 text-stone-600 hover:bg-stone-200';
            if (item.count >= 4) bgClass = 'bg-emerald-600 text-white font-bold';
            else if (item.count >= 2) bgClass = 'bg-emerald-400 text-white font-semibold';
            else if (item.count >= 1) bgClass = 'bg-emerald-200 text-emerald-950 font-medium';

            return (
              <button
                key={item.date}
                onClick={() => {
                  sound.playPop();
                  setSelectedDate(item.date);
                  const ref = state.reflections[item.date];
                  setNoteText(ref ? ref.note : '');
                  setMood(ref ? ref.mood : 'proud');
                }}
                className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${bgClass} ${
                  isSelected ? 'ring-2 ring-stone-900 ring-offset-2' : ''
                } ${isToday ? 'border-2 border-amber-400' : ''}`}
              >
                <span className="text-[10px] opacity-80">{item.dayName}</span>
                <span className="text-sm tabular-nums mt-0.5">{item.dayNum}</span>
                <span className="text-[10px] opacity-80 mt-0.5">
                  {item.count > 0 ? `${item.count} việc` : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Timeline & Journal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline of accomplishments */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 font-serif">
              Việc đã hoàn thành ngày {selectedDate}
            </h4>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg tabular-nums">
              {dayEntries.length} việc
            </span>
          </div>

          {dayEntries.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 space-y-1">
              <p>Chưa có ghi nhận việc hoàn thành vào ngày này.</p>
              <p>Hãy duy trì hoàn thành các thói quen mỗi ngày nhé!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200/70 bg-stone-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-stone-400 tabular-nums">
                      {item.time}
                    </span>
                    <span className="font-semibold text-stone-800">
                      {item.habitTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-500 tabular-nums">
                    <span className="text-amber-800 font-bold">+{item.seedsGained} 🌱</span>
                    <span className="text-emerald-700 font-bold">+{item.expGained} EXP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily reflection note */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <span>Nhật ký nhỏ ngày {selectedDate}</span>
            </h4>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 animate-fade-in">
                ✓ Đã lưu!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReflection} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Cảm xúc của bạn hôm nay thế nào?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'proud', label: 'Tự hào', icon: '🌟' },
                  { id: 'very_happy', label: 'Vui vẻ', icon: '😊' },
                  { id: 'peaceful', label: 'Bình yên', icon: '🍵' },
                  { id: 'tired', label: 'Hơi mệt', icon: '💤' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => {
                      sound.playPop();
                      setMood(m.id as DailyReflection['mood']);
                    }}
                    className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                      mood === m.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span className="text-lg block">{m.icon}</span>
                    <span className="text-[11px] block mt-0.5">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Lời nhắn cho chính mình:
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Hôm nay bạn thấy thế nào khi hoàn thành việc? Có điều gì làm bạn vui không?..."
                className="w-full p-3 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-emerald-600 leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Lưu cảm nghĩ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
