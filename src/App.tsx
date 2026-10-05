import React, { useState, useEffect } from 'react';
import {
  AppState,
  NavTabId,
  SproutCharacter,
  HabitItem,
  DailyReflection,
} from './types';
import { loadAppState, saveAppState, getRandomQuest } from './utils/storage';
import { sound } from './utils/audio';
import { HeaderSlideBar } from './components/HeaderSlideBar';
import { CharacterView } from './components/CharacterView';
import { TodayTasksView } from './components/TodayTasksView';
import { RandomQuestView } from './components/RandomQuestView';
import { GardenView } from './components/GardenView';
import { HistoryView } from './components/HistoryView';
import { ChallengesView } from './components/ChallengesView';
import { CollectionView } from './components/CollectionView';
import { Sparkles, Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<NavTabId>('character');
  const [levelUpModal, setLevelUpModal] = useState<{ newLevel: number; title: string } | null>(null);

  // Sync sound manager with state
  useEffect(() => {
    sound.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Save to localStorage on change
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Helper: Add EXP and handle level up
  const addExp = (amount: number) => {
    setState((prev) => {
      let newExp = prev.sprout.exp + amount;
      let newLevel = prev.sprout.level;
      let newExpNeeded = prev.sprout.expNeeded;
      let didLevelUp = false;

      while (newExp >= newExpNeeded) {
        newExp -= newExpNeeded;
        newLevel += 1;
        newExpNeeded = Math.round(newExpNeeded * 1.3);
        didLevelUp = true;
      }

      if (didLevelUp) {
        setTimeout(() => {
          sound.playLevelUp();
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
          const stageTitle =
            newLevel >= 12
              ? 'Thụ Thần Hoàng Kim'
              : newLevel >= 8
              ? 'Cây Non Tự Tin'
              : newLevel >= 5
              ? 'Bé Chồi Tràn Năng Lượng'
              : newLevel >= 3
              ? 'Mầm Xanh Tò Mò'
              : 'Hạt Mầm';
          setLevelUpModal({ newLevel, title: stageTitle });
        }, 300);
      }

      // Check if unlocked new character stages in collection
      const updatedCollections = prev.collections.map((item) => {
        if (item.id === 'stage_sapling' && newLevel >= 5) {
          return { ...item, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        if (item.id === 'stage_young_tree' && newLevel >= 8) {
          return { ...item, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        if (item.id === 'stage_golden_tree' && newLevel >= 12) {
          return { ...item, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        return item;
      });

      return {
        ...prev,
        collections: updatedCollections,
        sprout: {
          ...prev.sprout,
          level: newLevel,
          exp: newExp,
          expNeeded: newExpNeeded,
          mood: didLevelUp ? 'excited' : prev.sprout.mood,
        },
      };
    });
  };

  // Sound toggle
  const toggleSound = () => {
    setState((prev) => {
      const nextVal = !prev.soundEnabled;
      sound.enabled = nextVal;
      return { ...prev, soundEnabled: nextVal };
    });
  };

  // Spend water drops
  const spendDrops = (amount: number): boolean => {
    if (state.waterDrops < amount) return false;
    setState((prev) => ({ ...prev, waterDrops: prev.waterDrops - amount }));
    return true;
  };

  // Spend seeds
  const spendSeeds = (amount: number): boolean => {
    if (state.seeds < amount) return false;
    setState((prev) => ({ ...prev, seeds: prev.seeds - amount }));
    return true;
  };

  // Update sprout
  const updateSprout = (updater: (sprout: SproutCharacter) => SproutCharacter) => {
    setState((prev) => ({ ...prev, sprout: updater(prev.sprout) }));
  };

  // Complete habit
  const completeHabit = (habitId: string) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId);
      if (!habit) return prev;

      const wasDone = habit.completedToday;
      const updatedHabits = prev.habits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            completedToday: !wasDone,
            streak: !wasDone ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      });

      if (wasDone) {
        return { ...prev, habits: updatedHabits };
      }

      // Add history entry
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      const dateStr = now.toISOString().slice(0, 10);

      const newHistory = [
        {
          id: 'hist_' + Date.now(),
          date: dateStr,
          time: timeStr,
          action: 'Hoàn thành',
          habitTitle: habit.title,
          category: habit.category,
          seedsGained: habit.seedReward,
          expGained: habit.expReward,
        },
        ...prev.history,
      ];

      return {
        ...prev,
        seeds: prev.seeds + habit.seedReward,
        waterDrops: prev.waterDrops + habit.waterDropReward,
        habits: updatedHabits,
        history: newHistory,
      };
    });

    const target = state.habits.find((h) => h.id === habitId);
    if (target && !target.completedToday) {
      addExp(target.expReward);
    }
  };

  // Increment counter (e.g. water drinking)
  const incrementCounter = (habitId: string) => {
    setState((prev) => {
      const updatedHabits = prev.habits.map((h) => {
        if (h.id === habitId && h.type === 'counter') {
          const current = h.currentCount || 0;
          const target = h.targetCount || 8;
          const next = current + 1;
          const isFinished = next >= target;

          return {
            ...h,
            currentCount: next,
            completedToday: isFinished || h.completedToday,
            streak: isFinished && !h.completedToday ? h.streak + 1 : h.streak,
          };
        }
        return h;
      });

      // Bonus drops per glass
      return {
        ...prev,
        waterDrops: prev.waterDrops + 5,
        habits: updatedHabits,
        sprout: {
          ...prev.sprout,
          waterLevel: Math.min(100, prev.sprout.waterLevel + 10),
        },
      };
    });
    addExp(10);
  };

  // Add habit
  const addHabit = (newHabit: Omit<HabitItem, 'id' | 'streak' | 'completedToday'>) => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          id: 'habit_' + Date.now(),
          streak: 0,
          completedToday: false,
          ...newHabit,
        },
      ],
    }));
  };

  // Delete habit
  const deleteHabit = (habitId: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  // Reroll random quest
  const rerollQuest = () => {
    setState((prev) => ({
      ...prev,
      currentRandomQuest: getRandomQuest(prev.currentRandomQuest.title),
    }));
  };

  // Complete random quest
  const completeRandomQuest = () => {
    if (state.currentRandomQuest.completed) return;
    const quest = state.currentRandomQuest;

    setState((prev) => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      const dateStr = now.toISOString().slice(0, 10);

      const newHistory = [
        {
          id: 'quest_hist_' + Date.now(),
          date: dateStr,
          time: timeStr,
          action: 'Nhiệm vụ ngẫu nhiên',
          habitTitle: quest.title,
          category: quest.category,
          seedsGained: quest.seedReward,
          expGained: quest.expReward,
        },
        ...prev.history,
      ];

      return {
        ...prev,
        seeds: prev.seeds + quest.seedReward,
        waterDrops: prev.waterDrops + quest.waterDropReward,
        currentRandomQuest: { ...quest, completed: true },
        history: newHistory,
      };
    });

    addExp(quest.expReward);
  };

  // Garden: Plant seed
  const plantSeed = (
    plotIndex: number,
    plantType: string,
    name: string,
    costSeeds: number,
    waterNeeded: number,
    yieldSeeds: number,
    color: string
  ): boolean => {
    if (state.seeds < costSeeds) return false;

    setState((prev) => {
      const plots = [...prev.gardenPlots];
      plots[plotIndex] = {
        id: 'plant_' + Date.now(),
        plotIndex,
        plantType,
        name,
        plantedAt: new Date().toISOString().slice(0, 10),
        stage: 'seed',
        waterCount: 0,
        waterNeeded,
        color,
        harvestReady: false,
        yieldSeeds,
      };

      return {
        ...prev,
        seeds: prev.seeds - costSeeds,
        gardenPlots: plots,
      };
    });
    return true;
  };

  // Garden: Water plant
  const waterPlant = (plotIndex: number): boolean => {
    if (state.waterDrops < 5) return false;

    setState((prev) => {
      const plots = [...prev.gardenPlots];
      const plant = plots[plotIndex];
      if (!plant) return prev;

      const nextWaterCount = plant.waterCount + 1;
      const isReady = nextWaterCount >= plant.waterNeeded;

      let nextStage: typeof plant.stage = plant.stage;
      if (nextWaterCount === 1) nextStage = 'sprout';
      else if (nextWaterCount < plant.waterNeeded) nextStage = 'growing';
      else nextStage = 'bloomed';

      plots[plotIndex] = {
        ...plant,
        waterCount: nextWaterCount,
        stage: nextStage,
        harvestReady: isReady,
      };

      return {
        ...prev,
        waterDrops: prev.waterDrops - 5,
        gardenPlots: plots,
      };
    });

    addExp(10);
    return true;
  };

  // Garden: Harvest plant
  const harvestPlant = (plotIndex: number) => {
    const plant = state.gardenPlots[plotIndex];
    if (!plant || !plant.harvestReady) return;

    setState((prev) => {
      const plots = [...prev.gardenPlots];
      plots[plotIndex] = null; // Clear plot for new planting

      // Unlock plant in collections if not already
      const updatedCollections = prev.collections.map((item) => {
        if (item.id === plant.plantType) {
          return {
            ...item,
            unlocked: true,
            unlockedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return item;
      });

      return {
        ...prev,
        seeds: prev.seeds + plant.yieldSeeds,
        gardenPlots: plots,
        collections: updatedCollections,
      };
    });

    addExp(30);
  };

  // Garden: Buy decoration
  const buyDecoration = (decoId: string): boolean => {
    const deco = state.decorations.find((d) => d.id === decoId);
    if (!deco || state.seeds < deco.costSeeds) return false;

    setState((prev) => ({
      ...prev,
      seeds: prev.seeds - deco.costSeeds,
      decorations: prev.decorations.map((d) => (d.id === decoId ? { ...d, owned: true } : d)),
    }));
    return true;
  };

  // Save daily reflection
  const saveReflection = (date: string, note: string, mood: DailyReflection['mood']) => {
    setState((prev) => ({
      ...prev,
      reflections: {
        ...prev.reflections,
        [date]: { date, note, mood },
      },
    }));
  };

  // Check in challenge day
  const checkinChallengeDay = (challengeId: string) => {
    setState((prev) => {
      const updated = prev.challenges.map((c) => {
        if (c.id === challengeId) {
          const checkedCount = c.checkins.filter(Boolean).length;
          if (checkedCount >= c.durationDays) return c;

          const newCheckins = [...c.checkins];
          newCheckins[checkedCount] = true;
          const isComplete = checkedCount + 1 >= c.durationDays;

          return {
            ...c,
            currentDay: checkedCount + 1,
            checkins: newCheckins,
            completed: isComplete,
          };
        }
        return c;
      });

      return {
        ...prev,
        seeds: prev.seeds + 15,
        waterDrops: prev.waterDrops + 10,
        challenges: updated,
      };
    });
    addExp(25);
  };

  // Claim challenge reward
  const claimChallengeReward = (challengeId: string) => {
    const chal = state.challenges.find((c) => c.id === challengeId);
    if (!chal || !chal.completed || chal.claimed) return;

    setState((prev) => {
      const updatedChallenges = prev.challenges.map((c) =>
        c.id === challengeId ? { ...c, claimed: true } : c
      );

      // Unlock badge & accessory
      const updatedCollections = prev.collections.map((item) => {
        if (item.id === chal.badgeId) {
          return { ...item, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) };
        }
        if (chal.id === 'challenge_desk_7d' && item.id === 'hat_straw') {
          return { ...item, unlocked: true };
        }
        if (chal.id === 'challenge_reading_5d' && item.id === 'hat_glasses') {
          return { ...item, unlocked: true };
        }
        if (chal.id === 'challenge_sleep_7d' && item.id === 'hat_nightcap') {
          return { ...item, unlocked: true };
        }
        return item;
      });

      return {
        ...prev,
        seeds: prev.seeds + chal.rewardSeeds,
        waterDrops: prev.waterDrops + chal.rewardDrops,
        challenges: updatedChallenges,
        collections: updatedCollections,
      };
    });

    addExp(100);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-800 flex flex-col">
      {/* Top Slide Bar Navigation Header */}
      <HeaderSlideBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        state={state}
        onToggleSound={toggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'character' && (
          <CharacterView
            state={state}
            onUpdateSprout={updateSprout}
            onSpendDrops={spendDrops}
            onAddExp={addExp}
          />
        )}

        {currentTab === 'today' && (
          <TodayTasksView
            habits={state.habits}
            onCompleteHabit={completeHabit}
            onIncrementCounter={incrementCounter}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
          />
        )}

        {currentTab === 'random-quest' && (
          <RandomQuestView
            quest={state.currentRandomQuest}
            onRerollQuest={rerollQuest}
            onCompleteQuest={completeRandomQuest}
          />
        )}

        {currentTab === 'garden' && (
          <GardenView
            state={state}
            onPlantSeed={plantSeed}
            onWaterPlant={waterPlant}
            onHarvestPlant={harvestPlant}
            onBuyDecoration={buyDecoration}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            state={state}
            onSaveReflection={saveReflection}
          />
        )}

        {currentTab === 'challenges' && (
          <ChallengesView
            challenges={state.challenges}
            onCheckinChallengeDay={checkinChallengeDay}
            onClaimChallengeReward={claimChallengeReward}
          />
        )}

        {currentTab === 'collection' && (
          <CollectionView collections={state.collections} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/50 py-5 bg-white text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1">
            <span>🌱</span>
            <span className="font-semibold text-emerald-950">Mầm Nhỏ</span>
            <span>— Đồng hành xây dựng thói quen tốt mỗi ngày</span>
          </p>
          <p className="text-[11px] text-stone-400">
            Dành cho học sinh, sinh viên và những ai yêu thích sự kiên trì nhẹ nhàng.
          </p>
        </div>
      </footer>

      {/* Level Up Celebration Modal */}
      {levelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative space-y-4">
            <button
              onClick={() => setLevelUpModal(null)}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Chúc mừng bạn!
              </span>
              <h3 className="text-2xl font-black text-stone-900 font-serif">
                Bé Mầm Đã Lên Cấp {levelUpModal.newLevel}!
              </h3>
              <p className="text-sm font-semibold text-emerald-800">
                Giai đoạn: {levelUpModal.title}
              </p>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Nhờ sự chăm chỉ và kiên trì rèn luyện thói quen của bạn, Bé Mầm đã lớn thêm một chút và mở khóa những phần quà thú vị!
            </p>

            <button
              onClick={() => setLevelUpModal(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Tuyệt vời, tiếp tục thôi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
