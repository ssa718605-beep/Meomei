import React from 'react';
import { Challenge, AppState } from '../types';
import { Trophy, CheckCircle2, Gift, Sparkles, Flame, Clock } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ChallengesViewProps {
  challenges: Challenge[];
  onCheckinChallengeDay: (challengeId: string) => void;
  onClaimChallengeReward: (challengeId: string) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  onCheckinChallengeDay,
  onClaimChallengeReward,
}) => {
  const handleCheckin = (challengeId: string) => {
    sound.playChime();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
    onCheckinChallengeDay(challengeId);
  };

  const handleClaim = (challengeId: string) => {
    sound.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
    });
    onClaimChallengeReward(challengeId);
  };

  const completedCount = challenges.filter((c) => c.claimed).length;

  return (
    <div className="space-y-6">
      {/* Challenges Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Thử thách rèn luyện thói quen
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Duy trì chuỗi ngày liên tiếp để nhận vật phẩm độc quyền, nón xinh và hạt giống phong phú.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>
            Đã chinh phục: {completedCount}/{challenges.length}
          </span>
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="space-y-4">
        {challenges.map((challenge) => {
          const checkedDaysCount = challenge.checkins.filter(Boolean).length;
          const isAllCompleted = checkedDaysCount >= challenge.durationDays;
          const percent = Math.min(100, Math.round((checkedDaysCount / challenge.durationDays) * 100));

          return (
            <div
              key={challenge.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                challenge.claimed
                  ? 'bg-stone-50/70 border-stone-200 opacity-80'
                  : isAllCompleted
                  ? 'bg-amber-50/60 border-amber-300 shadow-xs ring-2 ring-amber-300/40'
                  : 'bg-white border-stone-200/80 shadow-xs hover:border-emerald-300'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Challenge Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                      {challenge.title}
                    </h3>

                    {challenge.claimed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        ✓ Đã hoàn thành & nhận quà
                      </span>
                    ) : isAllCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full animate-bounce">
                        🎉 Sẵn sàng nhận quà!
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-stone-600">{challenge.description}</p>

                  {/* Rewards preview */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-600 pt-1">
                    <span className="text-stone-400 font-normal">Phần thưởng:</span>
                    <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      🎁 {challenge.rewardItemName}
                    </span>
                    <span className="text-amber-800 tabular-nums">+{challenge.rewardSeeds} 🌱 Hạt</span>
                    <span className="text-sky-800 tabular-nums">+{challenge.rewardDrops} 💧 Sương</span>
                  </div>
                </div>

                {/* Progress Ring / Percentage & Action */}
                <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-medium text-stone-500">Tiến độ</span>
                    <p className="text-sm sm:text-base font-bold text-stone-900 tabular-nums">
                      {checkedDaysCount}/{challenge.durationDays} ngày ({percent}%)
                    </p>
                  </div>

                  {challenge.claimed ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold cursor-not-allowed"
                    >
                      Đã nhận thưởng
                    </button>
                  ) : isAllCompleted ? (
                    <button
                      onClick={() => handleClaim(challenge.id)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Nhận phần thưởng!</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckin(challenge.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Điểm danh ngày hôm nay</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day Check-in Nodes Row */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <p className="text-[11px] font-semibold text-stone-500 mb-2">
                  Lộ trình từng ngày:
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {challenge.checkins.map((done, idx) => (
                    <div
                      key={idx}
                      className={`min-w-[34px] h-[34px] rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        done
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : idx === checkedDaysCount
                          ? 'border-2 border-dashed border-emerald-500 text-emerald-700 bg-emerald-50/50'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                      title={`Ngày thứ ${idx + 1}`}
                    >
                      {done ? '✓' : idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
