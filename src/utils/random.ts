import type { GameEvent } from '../types/game';

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty list');
  }

  return items[Math.floor(Math.random() * items.length)]!;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index]!;
    result[index] = result[swapIndex]!;
    result[swapIndex] = current;
  }

  return result;
}

export function getRandomEvents(
  source: readonly GameEvent[],
  count: number,
  avoidIds: readonly string[] = [],
): GameEvent[] {
  const limit = Math.min(Math.max(count, 0), source.length);
  const avoid = new Set(avoidIds);
  const fresh = source.filter((event) => !avoid.has(event.id));
  const reused = source.filter((event) => avoid.has(event.id));
  const fromFresh = shuffle(fresh).slice(0, limit);
  const remaining = limit - fromFresh.length;
  const picked =
    remaining > 0 ? [...fromFresh, ...shuffle(reused).slice(0, remaining)] : fromFresh;
  const ids = picked.map((event) => event.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error('Random day selection must not contain duplicate events');
  }

  return reduceCategoryStreaks(picked);
}

function reduceCategoryStreaks(items: GameEvent[]): GameEvent[] {
  const result = [...items];

  for (let index = 2; index < result.length; index += 1) {
    const current = result[index];
    const previous = result[index - 1];
    const beforePrevious = result[index - 2];

    if (!current || !previous || !beforePrevious) {
      continue;
    }

    if (current.category === previous.category && current.category === beforePrevious.category) {
      const swapIndex = result.findIndex(
        (candidate, candidateIndex) =>
          candidateIndex > index && candidate.category !== current.category,
      );

      if (swapIndex !== -1) {
        result[index] = result[swapIndex]!;
        result[swapIndex] = current;
      }
    }
  }

  return result;
}
