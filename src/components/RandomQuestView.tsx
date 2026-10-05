import React, { useState, useEffect } from 'react';
import { RandomQuest } from '../types';
import { Dice5, CheckCircle2, Sparkles, Timer, Lightbulb, Play, Pause, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface RandomQuestViewProps {
  quest: RandomQuest;
  onRerollQuest: () => void;
  onCompleteQuest: () => void;
}

export const RandomQuestView: React.FC<RandomQuestViewProps> = ({
  quest,
  onRerollQuest,
  onCompleteQuest,
}) => {
  const [isRerolling, setIsRerolling] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(quest.durationMinutes * 60);

  // Reset timer when quest changes
  useEffect(() => {
    setTimerRunning(false);
    setSecondsLeft(quest.durationMinutes * 60);
  }, [quest.id, quest.durationMinutes]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (timerRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      sound.playLevelUp();
      confetti({ particleCount: 40, spread: 60 });
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerRunning, secondsLeft]);

  const handleReroll = () => {
    sound.playPop();
    setIsRerolling(true);
    setTimeout(() => {
      onRerollQuest();
      setIsRerolling(false);
    }, 400);
  };

  const handleComplete = () => {
    sound.playChime();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });
    onCompleteQuest();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎲</span>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Thử thách bất ngờ hôm nay
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Mỗi ngày một điều thú vị nho nhỏ để phá tan sự trì hoãn và tạo niềm vui học tập.
          </p>
        </div>

        <button
          onClick={handleReroll}
          disabled={isRerolling || quest.completed}
          className={`px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isRerolling ? 'animate-spin' : ''
          } ${quest.completed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Dice5 className="w-4 h-4 text-emerald-700" />
          <span>Đổi thử thách khác</span>
        </button>
      </div>

      {/* Main Quest Showcase Card */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 transition-all relative overflow-hidden shadow-xs ${
          quest.completed
            ? 'bg-emerald-50/70 border-emerald-300'
            : 'bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/50 border-amber-200/80'
        }`}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Tag and Duration */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <span className="text-base">✨</span>
              <span>Nhiệm vụ vi mô (Micro-Habit)</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Ước tính {quest.durationMinutes} phút</span>
            </div>

            {quest.completed && (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã hoàn thành hôm nay</span>
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif leading-tight">
              “{quest.title}”
            </h3>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {quest.description}
            </p>
          </div>

          {/* Tip / Why this helps box */}
          <div className="p-4 bg-white/80 rounded-xl border border-stone-200/80 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-stone-600">
              <span className="font-bold text-stone-800">Bật mí từ Bé Mầm: </span>
              <span>{quest.tip}</span>
            </div>
          </div>

          {/* Interactive Countdown Helper */}
          <div className="p-4 bg-white/60 rounded-xl border border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Timer className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-stone-800">
                  Đồng hồ bấm giờ làm ngay ({quest.durationMinutes} phút)
                </p>
                <p className="text-[11px] text-stone-500">
                  Bật đồng hồ và thực hiện ngay bây giờ để nhận trọn vẹn điểm thưởng!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-mono font-bold text-stone-800 tabular-nums">
                {formatTime(secondsLeft)}
              </span>

              <button
                onClick={() => {
                  sound.playPop();
                  setTimerRunning(!timerRunning);
                }}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Bắt đầu</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setTimerRunning(false);
                  setSecondsLeft(quest.durationMinutes * 60);
                }}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600"
                title="Đặt lại"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reward and Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-200/60">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-stone-700">
              <span className="text-stone-500">Phần thưởng:</span>
              <span className="text-amber-800 font-bold tabular-nums">+{quest.seedReward} 🌱 Hạt</span>
              <span className="text-sky-800 font-bold tabular-nums">+{quest.waterDropReward} 💧 Sương</span>
              <span className="text-emerald-700 font-bold tabular-nums">+{quest.expReward} EXP</span>
            </div>

            <button
              onClick={handleComplete}
              disabled={quest.completed}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                quest.completed
                  ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{quest.completed ? 'Đã nhận thưởng hôm nay' : 'Tôi đã làm xong! Nhận quà'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Philosophy of Micro-actions Card */}
      <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-4">
        <span className="text-3xl">🌱</span>
        <div className="space-y-1 text-xs text-stone-600 leading-relaxed">
          <h4 className="font-bold text-stone-900 text-sm font-serif">
            Quy tắc 2 phút & Thói quen vi mô
          </h4>
          <p>
            Khi cảm thấy lười hoặc ngại bắt đầu học, hãy chỉ tự nhủ làm một việc nhỏ trong 5–10 phút
            (như dọn lại chiếc bàn hay uống 1 cốc nước). Khi đã bắt đầu chuyển động, não bộ sẽ tự động
            vào guồng và việc học tiếp theo sẽ trở nên dễ dàng bất ngờ!
          </p>
        </div>
      </div>
    </div>
  );
};
