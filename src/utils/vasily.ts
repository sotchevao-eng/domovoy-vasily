import { vasilyMessages } from '../data/vasilyMessages';
import type { ChoiceRating, PlayerProgress } from '../types/game';
import { pickMemoryLine } from './memory';
import { pickRandom } from './random';

export function pickAvoiding(items: readonly string[], avoid?: string | null): string {
  if (items.length === 0) {
    return '';
  }

  const pool = items.length > 1 ? items.filter((item) => item !== avoid) : items;
  return pickRandom(pool.length > 0 ? pool : items);
}

export function getDecisionReaction(rating: ChoiceRating, explicit?: string): string {
  const trimmed = explicit?.trim();

  if (trimmed) {
    return trimmed;
  }

  if (rating === 'good') {
    return pickRandom(vasilyMessages.goodDecision);
  }

  if (rating === 'bad') {
    return pickRandom(vasilyMessages.badDecision);
  }

  return pickRandom(vasilyMessages.neutralDecision);
}

export function pickMorningMessage(
  avoid?: string | null,
  progress?: Pick<PlayerProgress, 'lastPlayAnswers'> | null,
): string {
  const memory = pickMemoryLine(progress);

  if (memory) {
    return memory;
  }

  return pickAvoiding(vasilyMessages.morning, avoid);
}

export function pickEveningMessage(avoid?: string | null): string {
  return pickAvoiding(vasilyMessages.evening, avoid);
}
