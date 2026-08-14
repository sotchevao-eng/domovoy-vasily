import { getRankByScore, pickBetterRank } from '../data/ranks';
import type { DaySummary, GameAnswerHistory, GameState, PlayerProgress } from '../types/game';
import { normalizePlayerProgress } from '../types/game';
import { getAnswerStats } from './answers';
import { calculateDayScore } from './scoring';

export function finalizeDayIfNeeded(
  game: GameState,
  progress: PlayerProgress,
): { game: GameState; progress: PlayerProgress } {
  const normalized = normalizePlayerProgress(progress);

  if (game.status !== 'completed' || game.isDayFinalized) {
    return { game, progress: normalized };
  }

  const score = calculateDayScore(game);
  const rank = getRankByScore(score);
  const dayAnswers = game.answers.filter((answer) => answer.day === game.day);
  const stats = getAnswerStats(dayAnswers);
  const isNewRecord = normalized.bestScore === null || score > normalized.bestScore;
  const summary: DaySummary = {
    day: game.day,
    score,
    rank: rank.title,
    stats: { ...game.stats },
    goodAnswers: stats.good,
    neutralAnswers: stats.neutral,
    badAnswers: stats.bad,
    completedAt: new Date().toISOString(),
  };

  return {
    game: {
      ...game,
      isDayFinalized: true,
      lastScoreIsRecord: isNewRecord,
    },
    progress: {
      ...normalized,
      bestScore: isNewRecord ? score : normalized.bestScore,
      bestRank: pickBetterRank(normalized.bestRank, rank.id),
      completedDaysCount: normalized.completedDaysCount + 1,
      dayHistory: [...normalized.dayHistory, summary],
      answerHistory: mergeAnswerHistory(normalized.answerHistory, game.answers),
      lastPlayAnswers: [...game.answers, ...(game.specialAnswers ?? [])],
    },
  };
}

function mergeAnswerHistory(
  history: GameAnswerHistory[],
  current: GameAnswerHistory[],
): GameAnswerHistory[] {
  const seen = new Set(history.map((answer) => `${answer.day}:${answer.eventId}`));
  const extra = current.filter((answer) => !seen.has(`${answer.day}:${answer.eventId}`));
  return [...history, ...extra];
}
