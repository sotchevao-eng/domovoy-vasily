import type { EventEffects, GameState, GameStats, StatKey } from '../types/game';
import { getAnswerStats } from './answers';

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function applyEffects(stats: GameStats, effects: EventEffects): GameStats {
  return {
    comfort: clamp(stats.comfort + (effects.comfort ?? 0)),
    building: clamp(stats.building + (effects.building ?? 0)),
    budget: stats.budget + (effects.budget ?? 0),
    reputation: clamp(stats.reputation + (effects.reputation ?? 0)),
  };
}

export function formatBudget(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

export function formatSignedNumber(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `−${Math.abs(value)}`;
  }

  return '0';
}

export function formatSignedBudget(value: number): string {
  const amount = new Intl.NumberFormat('ru-RU').format(Math.abs(value));

  if (value > 0) {
    return `+${amount} ₽`;
  }

  if (value < 0) {
    return `−${amount} ₽`;
  }

  return `${amount} ₽`;
}

export function formatEffectValue(key: StatKey, value: number): string {
  return key === 'budget' ? formatSignedBudget(value) : formatSignedNumber(value);
}

export const EFFECT_ENTRIES: { key: StatKey; label: string }[] = [
  { key: 'comfort', label: '❤️ Комфорт' },
  { key: 'building', label: '🔧 Состояние дома' },
  { key: 'budget', label: '💰 Бюджет' },
  { key: 'reputation', label: '⭐ Репутация' },
];

export function getBudgetScore(budget: number): number {
  if (budget >= 70000) {
    return 10;
  }

  if (budget >= 50000) {
    return 8;
  }

  if (budget >= 30000) {
    return 6;
  }

  if (budget >= 10000) {
    return 4;
  }

  if (budget >= 0) {
    return 2;
  }

  return 0;
}

export function calculateDayScore(gameState: Pick<GameState, 'stats' | 'answers' | 'day'>): number {
  const dayAnswers = gameState.answers.filter((answer) => answer.day === gameState.day);
  const { good, neutral } = getAnswerStats(dayAnswers);
  const statsScore =
    gameState.stats.comfort * 0.2 + gameState.stats.building * 0.2 + gameState.stats.reputation * 0.2;
  const decisionsScore = good * 3 + neutral * 1.5;
  const score = Math.round(statsScore + decisionsScore + getBudgetScore(gameState.stats.budget));

  return clamp(score, 0, 100);
}

export function getWeakestStatAdvice(stats: GameStats): string | null {
  const issues = [
    {
      active: stats.comfort < 40,
      gap: 40 - stats.comfort,
      text: 'С соседями завтра придётся поработать особенно внимательно.',
    },
    {
      active: stats.building < 40,
      gap: 40 - stats.building,
      text: 'Дом явно намекает, что технические вопросы пора ставить выше в списке.',
    },
    {
      active: stats.budget < 20000,
      gap: (20000 - stats.budget) / 1000,
      text: 'Кошелёк ТСЖ сегодня похудел сильнее, чем я после весенней уборки.',
    },
    {
      active: stats.reputation < 40,
      gap: 40 - stats.reputation,
      text: 'Похоже, завтра придётся не только работать, но и объяснять свои решения.',
    },
  ].filter((issue) => issue.active);

  if (issues.length === 0) {
    return null;
  }

  return issues.reduce((worst, issue) => (issue.gap > worst.gap ? issue : worst)).text;
}

if (import.meta.env.DEV) {
  if (clamp(98 + 10) !== 100) {
    throw new Error('Stat clamp failed: 98 + 10 must equal 100');
  }

  if (clamp(2 - 10) !== 0) {
    throw new Error('Stat clamp failed: 2 - 10 must equal 0');
  }

  const sampleScore = calculateDayScore({
    day: 1,
    stats: { comfort: 100, building: 100, budget: 100000, reputation: 100 },
    answers: Array.from({ length: 10 }, (_, index) => ({
      eventId: `e${index}`,
      choiceId: 'c',
      rating: 'good' as const,
      effects: {},
      timestamp: '',
      day: 1,
    })),
  });

  if (sampleScore !== 100) {
    throw new Error(`Perfect day must score 100, got ${sampleScore}`);
  }
}
