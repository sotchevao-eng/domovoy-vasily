import {
  SPECIAL_EVENT_CHANCE,
  SPECIAL_EVENTS_BY_ID,
  SPECIAL_EVENTS_PER_DAY_MAX,
  specialEvents,
} from '../data/specialEvents';
import type { GameAnswerHistory, GameState, SpecialEvent, SpecialEventChoice } from '../types/game';
import { pickRandom, shuffle } from './random';

export function findSpecialEventById(id: string | null | undefined): SpecialEvent | undefined {
  if (!id) {
    return undefined;
  }

  return SPECIAL_EVENTS_BY_ID.get(id);
}

export function getSpecialAnswer(
  state: Pick<GameState, 'specialAnswers'>,
  eventId: string | null | undefined,
): GameAnswerHistory | undefined {
  if (!eventId) {
    return undefined;
  }

  return state.specialAnswers.find((entry) => entry.eventId === eventId);
}

export function rollSpecialEvent(state: GameState): SpecialEvent | null {
  const shownToday = state.specialEventsShownToday ?? [];

  if (state.activeSpecialEventId) {
    return null;
  }

  if (shownToday.length >= SPECIAL_EVENTS_PER_DAY_MAX) {
    return null;
  }

  if (Math.random() >= SPECIAL_EVENT_CHANCE) {
    return null;
  }

  const shown = new Set(shownToday);
  const available = specialEvents.filter((event) => !shown.has(event.id));

  if (available.length === 0) {
    return null;
  }

  return pickRandom(available);
}

export function createSpecialChoiceOrder(event: SpecialEvent): string[] {
  return shuffle(event.choices ?? []).map((choice) => choice.id);
}

export function orderSpecialChoices(
  event: SpecialEvent,
  order: string[] | undefined,
): SpecialEventChoice[] {
  const choices = event.choices ?? [];

  if (!order || order.length === 0) {
    return choices;
  }

  const byId = new Map(choices.map((choice) => [choice.id, choice]));
  const ordered = order
    .map((choiceId) => byId.get(choiceId))
    .filter((choice): choice is SpecialEventChoice => Boolean(choice));
  const missing = choices.filter((choice) => !order.includes(choice.id));

  return [...ordered, ...missing];
}

export function getImplicitSpecialChoice(event: SpecialEvent): SpecialEventChoice {
  return {
    id: event.type,
    text: 'Продолжить',
    rating: 'good',
    effects: { ...(event.effects ?? {}) },
    result: event.result ?? event.description,
    vasilyReaction: event.vasilyReaction ?? event.vasilyText,
  };
}
