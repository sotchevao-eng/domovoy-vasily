import { achievements, getAchievementById } from '../data/achievements';
import { playSound } from '../services/soundService';
import type {
  AchievementDefinition,
  GameAnswerHistory,
  GameState,
  PlayerProgress,
  UnlockedAchievement,
} from '../types/game';
import { normalizePlayerProgress } from '../types/game';
import { getMaxGoodStreak } from './answers';
import { findEventById } from './events';
import { calculateDayScore } from './scoring';

export function checkAchievements(
  gameState: GameState,
  playerProgress: PlayerProgress,
): AchievementDefinition[] {
  const progress = normalizePlayerProgress(playerProgress);
  const unlockedIds = new Set(progress.unlockedAchievements.map((item) => item.id));
  const answers = getAllAnswers(gameState, progress);
  const dayAnswers = getDayAnswers(gameState);
  const score = gameState.status === 'completed' ? calculateDayScore(gameState) : null;

  return achievements.filter((achievement) => {
    if (unlockedIds.has(achievement.id)) {
      return false;
    }

    return isAchievementUnlocked(achievement.id, {
      gameState,
      progress,
      answers,
      dayAnswers,
      score,
    });
  });
}

export function applyAchievementUnlocks(
  gameState: GameState,
  playerProgress: PlayerProgress,
): {
  game: GameState;
  progress: PlayerProgress;
  newly: AchievementDefinition[];
} {
  const progress = normalizePlayerProgress(playerProgress);
  const newly = checkAchievements(gameState, progress);

  if (newly.length === 0) {
    return { game: gameState, progress, newly };
  }

  const unlockedAt = new Date().toISOString();
  const unlocked: UnlockedAchievement[] = newly.map((achievement) => ({
    id: achievement.id,
    unlockedAt,
    day: gameState.day,
  }));

  return {
    game: {
      ...gameState,
      lastUnlockedAchievementIds: uniqueIds([
        ...(gameState.lastUnlockedAchievementIds ?? []),
        ...newly.map((achievement) => achievement.id),
      ]),
    },
    progress: {
      ...progress,
      unlockedAchievements: mergeUnlockedAchievements(progress.unlockedAchievements, unlocked),
    },
    newly,
  };
}

export function getUnlockedAchievementMap(
  progress: PlayerProgress,
): Map<string, UnlockedAchievement> {
  return new Map(normalizePlayerProgress(progress).unlockedAchievements.map((item) => [item.id, item]));
}

export function formatUnlockDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ru-RU').format(date);
}

export function getNewAchievementsForDay(
  gameState: GameState,
): AchievementDefinition[] {
  return (gameState.lastUnlockedAchievementIds ?? [])
    .map((id) => getAchievementById(id))
    .filter((item): item is AchievementDefinition => Boolean(item));
}

export function notifyAchievementUnlock(_achievement: AchievementDefinition) {
  playSound('achievement');
}

function isAchievementUnlocked(
  id: string,
  context: {
    gameState: GameState;
    progress: PlayerProgress;
    answers: GameAnswerHistory[];
    dayAnswers: GameAnswerHistory[];
    score: number | null;
  },
): boolean {
  const { gameState, progress, answers, dayAnswers, score } = context;
  const { stats } = gameState;
  const dayCompleted = gameState.status === 'completed';

  switch (id) {
    case 'first-day':
      return progress.completedDaysCount >= 1;
    case 'maintenance-master':
      return countGoodAnswersByCategory(answers, 'maintenance') >= 5;
    case 'neighbors-favorite':
      return stats.comfort >= 90;
    case 'authority':
      return stats.reputation >= 90;
    case 'thrifty-keeper':
      return (
        dayCompleted &&
        stats.building >= 75 &&
        stats.comfort >= 70 &&
        stats.budget >= 70000
      );
    case 'stay-calm':
      return dayCompleted && allEmergencyEventsSolvedWell(gameState, dayAnswers);
    case 'domovoy-approves':
      return dayCompleted && score !== null && score >= 90;
    case 'tea-with-vasily':
      return hasSeenSpecialEvent(gameState, progress, 'tea-break');
    case 'house-lives':
      return getSeenSpecialEventIds(gameState, progress).length >= 5;
    case 'perfect-day':
      return dayCompleted && dayAnswers.length > 0 && dayAnswers.every((answer) => answer.rating !== 'bad');
    case 'no-panic':
      return getMaxGoodStreak(answers) >= 5;
    case 'house-in-order':
      return stats.building >= 95;
    case 'pro-growth':
      return progress.completedDaysCount >= 5;
    case 'precise-calc':
      return dayCompleted && score !== null && score >= 98;
    default:
      return false;
  }
}

function getAllAnswers(gameState: GameState, progress: PlayerProgress): GameAnswerHistory[] {
  const past = progress.answerHistory ?? [];
  const seen = new Set(past.map((answer) => answerKey(answer)));
  const extra = gameState.answers.filter((answer) => !seen.has(answerKey(answer)));
  return [...past, ...extra];
}

function getDayAnswers(gameState: GameState): GameAnswerHistory[] {
  return gameState.answers.filter((answer) => answer.day === gameState.day);
}

function countGoodAnswersByCategory(
  answers: readonly GameAnswerHistory[],
  category: 'maintenance',
): number {
  return answers.filter((answer) => {
    if (answer.rating !== 'good') {
      return false;
    }

    return findEventById(answer.eventId)?.category === category;
  }).length;
}

function allEmergencyEventsSolvedWell(
  gameState: GameState,
  dayAnswers: readonly GameAnswerHistory[],
): boolean {
  const emergencyIds = gameState.selectedEventIds.filter(
    (eventId) => findEventById(eventId)?.category === 'emergency',
  );

  if (emergencyIds.length === 0) {
    return false;
  }

  return emergencyIds.every((eventId) => {
    const answer = dayAnswers.find((entry) => entry.eventId === eventId);
    return answer?.rating === 'good';
  });
}

function mergeUnlockedAchievements(
  current: UnlockedAchievement[],
  incoming: UnlockedAchievement[],
): UnlockedAchievement[] {
  const merged = [...current];
  const seen = new Set(current.map((item) => item.id));

  for (const item of incoming) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    merged.push(item);
  }

  return merged;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function getSeenSpecialEventIds(gameState: GameState, progress: PlayerProgress): string[] {
  return uniqueIds([
    ...(progress.seenSpecialEventIds ?? []),
    ...(gameState.specialEventsShownToday ?? []),
    ...(gameState.activeSpecialEventId ? [gameState.activeSpecialEventId] : []),
  ]);
}

function hasSeenSpecialEvent(gameState: GameState, progress: PlayerProgress, eventId: string): boolean {
  return getSeenSpecialEventIds(gameState, progress).includes(eventId);
}

function answerKey(answer: GameAnswerHistory): string {
  return `${answer.day}:${answer.eventId}`;
}
