import type { ChoiceRating, GameAnswerHistory } from '../types/game';

export interface AnswerStats {
  good: number;
  neutral: number;
  bad: number;
}

export function getAnswerStats(answers: readonly GameAnswerHistory[]): AnswerStats {
  return answers.reduce<AnswerStats>(
    (stats, answer) => {
      stats[answer.rating] += 1;
      return stats;
    },
    { good: 0, neutral: 0, bad: 0 },
  );
}

export function getGoodAnswersCount(answers: readonly GameAnswerHistory[]): number {
  return countRating(answers, 'good');
}

export function getNeutralAnswersCount(answers: readonly GameAnswerHistory[]): number {
  return countRating(answers, 'neutral');
}

export function getBadAnswersCount(answers: readonly GameAnswerHistory[]): number {
  return countRating(answers, 'bad');
}

export function getDaySummaryLine(goodCount: number): string {
  if (goodCount > 7) {
    return 'Ну что сказать — дом сегодня в надёжных руках!';
  }

  if (goodCount >= 5) {
    return 'Неплохо. Но пару решений я бы ещё обсудил за чашкой чая.';
  }

  return 'День был непростой. Зато теперь мы знаем, где можно действовать лучше.';
}

export function getMaxGoodStreak(answers: readonly GameAnswerHistory[]): number {
  let max = 0;
  let current = 0;

  for (const answer of answers) {
    if (answer.rating === 'good') {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
}

function countRating(answers: readonly GameAnswerHistory[], rating: ChoiceRating): number {
  return answers.filter((answer) => answer.rating === rating).length;
}
