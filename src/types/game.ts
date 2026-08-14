export type HouseZone =
  | 'roof'
  | 'entrance'
  | 'stairs'
  | 'elevator'
  | 'yard'
  | 'parking'
  | 'waste'
  | 'technical'
  | 'lobby';

export type GameStatus = 'new' | 'playing' | 'completed';

export type StatKey = 'comfort' | 'building' | 'budget' | 'reputation';

export type ChoiceRating = 'good' | 'neutral' | 'bad';

export type EventCategory =
  | 'maintenance'
  | 'emergency'
  | 'cleaning'
  | 'yard'
  | 'parking'
  | 'animals'
  | 'finance'
  | 'neighbors'
  | 'meeting'
  | 'documents'
  | 'security';

export interface GameStats {
  comfort: number;
  building: number;
  budget: number;
  reputation: number;
}

export interface EventEffects {
  comfort?: number;
  building?: number;
  budget?: number;
  reputation?: number;
}

export type ChoiceEffect = EventEffects;

export interface GameChoice {
  id: string;
  text: string;
  rating: ChoiceRating;
  effects: EventEffects;
  result: string;
  vasilyReaction?: string;
}

export type SpecialEventType = 'bonus' | 'choice' | 'story';

export interface SpecialEventChoice {
  id: string;
  text: string;
  rating: ChoiceRating;
  effects: EventEffects;
  result: string;
  vasilyReaction?: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  description: string;
  vasilyText: string;
  type: SpecialEventType;
  probability?: number;
  effects?: EventEffects;
  result?: string;
  vasilyReaction?: string;
  choices?: SpecialEventChoice[];
  zone?: HouseZone;
}

export interface GameEvent {
  id: string;
  category: EventCategory;
  time: string;
  location: string;
  zone: HouseZone;
  title: string;
  description: string;
  vasilyText: string;
  choices: GameChoice[];
}

export type AchievementIcon =
  | 'trophy'
  | 'wrench'
  | 'heart'
  | 'star'
  | 'wallet'
  | 'shield'
  | 'home'
  | 'coffee'
  | 'sparkles'
  | 'brain'
  | 'building'
  | 'growth'
  | 'target'
  | 'leaf';

export type AchievementCategory =
  | 'house'
  | 'residents'
  | 'decisions'
  | 'rating'
  | 'experience'
  | 'secret';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  category: AchievementCategory;
  hidden?: boolean;
  vasilyText?: string;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
  day?: number;
}

export interface GameAnswerHistory {
  eventId: string;
  choiceId: string;
  rating: ChoiceRating;
  effects: EventEffects;
  timestamp: string;
  day: number;
}

export interface GameState {
  day: number;
  stats: GameStats;
  dayStartStats: GameStats;
  currentEventIndex: number;
  selectedEventIds: string[];
  choiceOrderByEventId: Record<string, string[]>;
  answers: GameAnswerHistory[];
  status: GameStatus;
  isDayFinalized: boolean;
  lastScoreIsRecord: boolean;
  lastUnlockedAchievementIds: string[];
  activeSpecialEventId: string | null;
  specialEventsShownToday: string[];
  specialAnswers: GameAnswerHistory[];
  specialChoiceOrders: Record<string, string[]>;
  morningMessage: string;
  eveningMessage: string;
}

export type RankId =
  | 'needs-vasily'
  | 'beginner'
  | 'good-neighbor'
  | 'experienced'
  | 'house-keeper';

export interface GameRank {
  id: RankId;
  min: number;
  max: number;
  title: string;
  icon: string;
  vasilyText: string;
}

export interface DaySummary {
  day: number;
  score: number;
  rank: string;
  stats: GameStats;
  goodAnswers: number;
  neutralAnswers: number;
  badAnswers: number;
  completedAt: string;
}

export interface PlayerProgress {
  bestScore: number | null;
  bestRank: RankId | null;
  completedDaysCount: number;
  dayHistory: DaySummary[];
  unlockedAchievements: UnlockedAchievement[];
  answerHistory: GameAnswerHistory[];
  seenSpecialEventIds: string[];
  lastPlayAnswers: GameAnswerHistory[];
}

export interface GameSettings {
  sound: boolean;
  reduceMotion: boolean;
}

export const INITIAL_GAME_STATE: GameState = {
  day: 1,
  stats: {
    comfort: 70,
    building: 75,
    budget: 100000,
    reputation: 60,
  },
  dayStartStats: {
    comfort: 70,
    building: 75,
    budget: 100000,
    reputation: 60,
  },
  currentEventIndex: 0,
  selectedEventIds: [],
  choiceOrderByEventId: {},
  answers: [],
  status: 'new',
  isDayFinalized: false,
  lastScoreIsRecord: false,
  lastUnlockedAchievementIds: [],
  activeSpecialEventId: null,
  specialEventsShownToday: [],
  specialAnswers: [],
  specialChoiceOrders: {},
  morningMessage: '',
  eveningMessage: '',
};

export const INITIAL_PLAYER_PROGRESS: PlayerProgress = {
  bestScore: null,
  bestRank: null,
  completedDaysCount: 0,
  dayHistory: [],
  unlockedAchievements: [],
  answerHistory: [],
  seenSpecialEventIds: [],
  lastPlayAnswers: [],
};

export const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  reduceMotion: false,
};

export const STORAGE_KEYS = {
  gameState: 'vasily-house-game-state',
  playerProgress: 'vasily-house-player-progress',
  settings: 'vasily-house-settings',
} as const;

export const LEGACY_SETTINGS_STORAGE_KEY = 'domovoy-vasily-settings';

export const SAVE_STORAGE_KEY = STORAGE_KEYS.gameState;
export const PROGRESS_STORAGE_KEY = STORAGE_KEYS.playerProgress;
export const SETTINGS_STORAGE_KEY = STORAGE_KEYS.settings;

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as GameState;
  const stats = candidate.stats;

  return (
    typeof candidate.day === 'number' &&
    Number.isFinite(candidate.day) &&
    typeof candidate.currentEventIndex === 'number' &&
    Number.isFinite(candidate.currentEventIndex) &&
    Array.isArray(candidate.selectedEventIds) &&
    Array.isArray(candidate.answers) &&
    (candidate.status === 'new' ||
      candidate.status === 'playing' ||
      candidate.status === 'completed') &&
    !!stats &&
    typeof stats === 'object' &&
    typeof stats.comfort === 'number' &&
    Number.isFinite(stats.comfort) &&
    typeof stats.building === 'number' &&
    Number.isFinite(stats.building) &&
    typeof stats.budget === 'number' &&
    Number.isFinite(stats.budget) &&
    typeof stats.reputation === 'number' &&
    Number.isFinite(stats.reputation)
  );
}

export function createInitialGameState(status: GameStatus = 'new'): GameState {
  return {
    day: INITIAL_GAME_STATE.day,
    stats: { ...INITIAL_GAME_STATE.stats },
    dayStartStats: { ...INITIAL_GAME_STATE.stats },
    currentEventIndex: 0,
    selectedEventIds: [],
    choiceOrderByEventId: {},
    answers: [],
    status,
    isDayFinalized: false,
    lastScoreIsRecord: false,
    lastUnlockedAchievementIds: [],
    activeSpecialEventId: null,
    specialEventsShownToday: [],
    specialAnswers: [],
    specialChoiceOrders: {},
    morningMessage: '',
    eveningMessage: '',
  };
}

export function normalizePlayerProgress(value: PlayerProgress): PlayerProgress {
  return {
    bestScore: value.bestScore ?? null,
    bestRank: value.bestRank ?? null,
    completedDaysCount: Number.isFinite(value.completedDaysCount) ? value.completedDaysCount : 0,
    dayHistory: Array.isArray(value.dayHistory) ? value.dayHistory : [],
    unlockedAchievements: uniqueUnlockedAchievements(value.unlockedAchievements),
    answerHistory: Array.isArray(value.answerHistory) ? value.answerHistory : [],
    seenSpecialEventIds: uniqueStringIds(value.seenSpecialEventIds),
    lastPlayAnswers: Array.isArray(value.lastPlayAnswers) ? value.lastPlayAnswers : [],
  };
}

function uniqueStringIds(list: string[] | undefined): string[] {
  if (!Array.isArray(list)) {
    return [];
  }

  return [...new Set(list.filter((item) => typeof item === 'string' && item.length > 0))];
}

function uniqueUnlockedAchievements(list: UnlockedAchievement[] | undefined): UnlockedAchievement[] {
  if (!Array.isArray(list)) {
    return [];
  }

  const seen = new Set<string>();
  const result: UnlockedAchievement[] = [];

  for (const item of list) {
    if (!item || typeof item.id !== 'string' || typeof item.unlockedAt !== 'string' || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    result.push({
      id: item.id,
      unlockedAt: item.unlockedAt,
      day: typeof item.day === 'number' ? item.day : undefined,
    });
  }

  return result;
}

export function isPlayerProgress(value: unknown): value is PlayerProgress {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as PlayerProgress;

  return (
    (candidate.bestScore === null ||
      (typeof candidate.bestScore === 'number' && Number.isFinite(candidate.bestScore))) &&
    (candidate.bestRank === null || typeof candidate.bestRank === 'string') &&
    typeof candidate.completedDaysCount === 'number' &&
    Number.isFinite(candidate.completedDaysCount) &&
    Array.isArray(candidate.dayHistory)
  );
}
