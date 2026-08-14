import { events } from '../data/events';
import type { GameChoice, GameEvent, GameState } from '../types/game';
import { shuffle } from './random';

export function createChoiceOrders(eventList: readonly GameEvent[]): Record<string, string[]> {
  return Object.fromEntries(
    eventList.map((event) => [event.id, shuffle(event.choices).map((choice) => choice.id)]),
  );
}

export function orderChoices(event: GameEvent, order: string[] | undefined): GameChoice[] {
  if (!order || order.length === 0) {
    return event.choices;
  }

  const byId = new Map(event.choices.map((choice) => [choice.id, choice]));
  const ordered = order
    .map((choiceId) => byId.get(choiceId))
    .filter((choice): choice is GameChoice => Boolean(choice));
  const missing = event.choices.filter((choice) => !order.includes(choice.id));

  return [...ordered, ...missing];
}

export function findEventById(eventId: string | undefined): GameEvent | undefined {
  if (!eventId) {
    return undefined;
  }

  return events.find((event) => event.id === eventId);
}

export function getCurrentEventId(state: Pick<GameState, 'selectedEventIds' | 'currentEventIndex'>): string | undefined {
  return state.selectedEventIds[state.currentEventIndex];
}

export function getNextValidEventIndex(state: GameState): number {
  const { selectedEventIds, currentEventIndex } = state;

  if (selectedEventIds.length === 0) {
    return 0;
  }

  let index = Math.max(0, currentEventIndex);

  while (index < selectedEventIds.length && !findEventById(selectedEventIds[index])) {
    index += 1;
  }

  return index;
}
