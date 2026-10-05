export type NavTabId =
  | 'character'
  | 'today'
  | 'random-quest'
  | 'garden'
  | 'history'
  | 'challenges'
  | 'collection';

export interface SproutCharacter {
  name: string;
  level: number;
  exp: number;
  expNeeded: number;
  mood: 'happy' | 'excited' | 'sleepy' | 'curious' | 'blooming';
  waterLevel: number; // 0 - 100
  sunLevel: number; // 0 - 100
  loveLevel: number; // 0 - 100
  stageId: string;
  equippedHat?: string;
  equippedAccessory?: string;
  unlockedCostumes: string[];
}

export type HabitCategory = 'health' | 'study' | 'mindfulness' | 'routine';

export interface HabitItem {
  id: string;
  title: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
  expReward: number;
  seedReward: number;
  waterDropReward: number;
  type: 'simple' | 'counter';
  currentCount?: number;
  targetCount?: number;
  unit?: string;
  iconName: string;
  note?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface RandomQuest {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  tip: string;
  durationMinutes: number;
  expReward: number;
  seedReward: number;
  waterDropReward: number;
  completed: boolean;
  dateAssigned: string;
}

export interface GardenPlant {
  id: string;
  plotIndex: number;
  plantType: string;
  name: string;
  plantedAt: string;
  stage: 'seed' | 'sprout' | 'growing' | 'bloomed';
  waterCount: number;
  waterNeeded: number;
  color: string;
  harvestReady: boolean;
  yieldSeeds: number;
}

export interface GardenDecoration {
  id: string;
  name: string;
  icon: string;
  description: string;
  costSeeds: number;
  owned: boolean;
  placedOnPlot?: number;
}

export interface HistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  action: string;
  habitTitle: string;
  category: HabitCategory;
  seedsGained: number;
  expGained: number;
}

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  note: string;
  mood: 'very_happy' | 'peaceful' | 'tired' | 'proud';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  currentDay: number;
  completed: boolean;
  claimed: boolean;
  badgeId: string;
  rewardSeeds: number;
  rewardDrops: number;
  rewardItemName: string;
  checkins: boolean[]; // array of booleans for each day
  icon: string;
}

export interface CollectionItem {
  id: string;
  type: 'character_stage' | 'plant' | 'pet' | 'accessory' | 'badge';
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AppState {
  sprout: SproutCharacter;
  seeds: number;
  waterDrops: number;
  habits: HabitItem[];
  currentRandomQuest: RandomQuest;
  gardenPlots: (GardenPlant | null)[];
  decorations: GardenDecoration[];
  history: HistoryEntry[];
  reflections: Record<string, DailyReflection>;
  challenges: Challenge[];
  collections: CollectionItem[];
  lastLoginDate: string;
  soundEnabled: boolean;
}
