import { MEMORY_HINTS, memoryKey } from '../data/memoryHints';
import type { GameAnswerHistory, PlayerProgress } from '../types/game';
import { pickRandom } from './random';

const GENERIC_BAD_MEMORY = [
  'Дом ещё помнит вчерашние решения. Особенно те, после которых остались следы.',
  'Я вчерашний обход не вычеркнул. Дом тоже не вычеркнул.',
];

export function pickMemoryLine(
  progress: Pick<PlayerProgress, 'lastPlayAnswers'> | null | undefined,
): string | null {
  const answers = progress?.lastPlayAnswers ?? [];

  if (answers.length === 0) {
    return null;
  }

  const hinted = collectHintedLines(answers);
  const badHinted = hinted.filter((item) => item.rating === 'bad').map((item) => item.line);
  const otherHinted = hinted.filter((item) => item.rating !== 'bad').map((item) => item.line);
  const pool = badHinted.length > 0 ? badHinted : otherHinted;

  if (pool.length > 0) {
    return pickRandom(pool);
  }

  if (answers.some((answer) => answer.rating === 'bad')) {
    return pickRandom(GENERIC_BAD_MEMORY);
  }

  return null;
}

function collectHintedLines(answers: readonly GameAnswerHistory[]) {
  return answers.flatMap((answer) => {
    const line = MEMORY_HINTS[memoryKey(answer)];

    if (!line) {
      return [];
    }

    return [{ line, rating: answer.rating }];
  });
}
