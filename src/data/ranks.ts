import type { GameRank, RankId } from '../types/game';

export const GAME_RANKS: GameRank[] = [
  {
    id: 'house-keeper',
    min: 90,
    max: 100,
    title: 'Хранитель дома',
    icon: '🏆',
    vasilyText: 'Да я теперь могу спокойно уйти в отпуск! Хотя нет… лучше не буду рисковать.',
  },
  {
    id: 'experienced',
    min: 75,
    max: 89,
    title: 'Опытный управдом',
    icon: '⭐',
    vasilyText:
      'Вот это уже серьёзный подход. Дом доволен, соседи почти довольны — а это, поверь, большое достижение.',
  },
  {
    id: 'good-neighbor',
    min: 55,
    max: 74,
    title: 'Хороший сосед',
    icon: '🙂',
    vasilyText: 'Неплохо! Дом стоит, соседи не разбежались, бюджет ещё жив. Есть куда расти.',
  },
  {
    id: 'beginner',
    min: 35,
    max: 54,
    title: 'Начинающий хранитель',
    icon: '🧹',
    vasilyText: 'День был непростой. Зато теперь понятно, где стоит быть внимательнее.',
  },
  {
    id: 'needs-vasily',
    min: 0,
    max: 34,
    title: 'Дому нужен Василий',
    icon: '🏚',
    vasilyText: 'Кажется, мне пока рановато отдавать тебе все ключи. Но второй шанс никто не отменял.',
  },
];

export const RANK_SCALE = [0, 35, 55, 75, 90, 100] as const;

export function getRankByScore(score: number): GameRank {
  return GAME_RANKS.find((rank) => score >= rank.min && score <= rank.max) ?? GAME_RANKS[GAME_RANKS.length - 1]!;
}

export function getRankById(id: RankId | null): GameRank | null {
  if (!id) {
    return null;
  }

  return GAME_RANKS.find((rank) => rank.id === id) ?? null;
}

export function pickBetterRank(current: RankId | null, next: RankId): RankId {
  const currentRank = getRankById(current);
  const nextRank = getRankById(next);

  if (!currentRank) {
    return next;
  }

  if (!nextRank) {
    return currentRank.id;
  }

  return nextRank.min > currentRank.min ? nextRank.id : currentRank.id;
}
