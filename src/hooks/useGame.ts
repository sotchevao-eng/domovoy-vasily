import { Fragment, createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AchievementToastHost } from '../components/AchievementToast';
import { EVENTS_PER_DAY } from '../data/day';
import { events } from '../data/events';
import {
  INITIAL_GAME_STATE,
  INITIAL_PLAYER_PROGRESS,
  PROGRESS_STORAGE_KEY,
  SAVE_STORAGE_KEY,
  createInitialGameState,
  isGameState,
  isPlayerProgress,
  normalizePlayerProgress,
} from '../types/game';
import type { AchievementDefinition, GameAnswerHistory, GameChoice, GameEvent, GameState, PlayerProgress, SpecialEvent, SpecialEventChoice } from '../types/game';
import { applyAchievementUnlocks } from '../utils/achievements';
import { createChoiceOrders, findEventById, getCurrentEventId, getNextValidEventIndex } from '../utils/events';
import { finalizeDayIfNeeded } from '../utils/progress';
import { getRandomEvents } from '../utils/random';
import { applyEffects } from '../utils/scoring';
import {
  createSpecialChoiceOrder,
  findSpecialEventById,
  getImplicitSpecialChoice,
  getSpecialAnswer,
  rollSpecialEvent,
} from '../utils/specialEvents';
import { pickEveningMessage, pickMorningMessage } from '../utils/vasily';
import { useLocalStorage } from './useLocalStorage';

interface GameContextValue {
  gameState: GameState;
  progress: PlayerProgress;
  canContinue: boolean;
  isPlaying: boolean;
  isCompleted: boolean;
  currentEvent: GameEvent | null;
  currentAnswer: GameAnswerHistory | undefined;
  activeSpecialEvent: SpecialEvent | null;
  specialAnswer: GameAnswerHistory | undefined;
  eventsInDay: number;
  isLastEvent: boolean;
  hasFinishedEvents: boolean;
  startNewGame: () => void;
  continueGame: () => boolean;
  updateStats: (delta: GameChoice['effects']) => void;
  setCurrentEventIndex: (index: number) => void;
  resolveChoice: (event: GameEvent, choice: GameChoice) => void;
  resolveSpecialChoice: (event: SpecialEvent, choice: SpecialEventChoice) => void;
  resolveSpecialContinue: (event: SpecialEvent) => void;
  goToNextEvent: () => boolean;
  finishSpecialEvent: () => boolean;
  completeDay: () => boolean;
  finalizeDay: () => void;
  resetCurrentGame: () => void;
  resetAllProgress: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    SAVE_STORAGE_KEY,
    createInitialGameState(),
    isGameState,
  );
  const [progress, setProgress] = useLocalStorage<PlayerProgress>(
    PROGRESS_STORAGE_KEY,
    INITIAL_PLAYER_PROGRESS,
    isPlayerProgress,
  );
  const [toastQueue, setToastQueue] = useState<AchievementDefinition[]>([]);

  const stateRef = useRef(gameState);
  const progressRef = useRef(progress);
  stateRef.current = gameState;
  progressRef.current = progress;

  const enqueueUnlocks = useCallback((newly: AchievementDefinition[]) => {
    if (newly.length === 0) {
      return;
    }

    setToastQueue((current) => {
      const seen = new Set(current.map((item) => item.id));
      const extra = newly.filter((item) => !seen.has(item.id));
      return extra.length > 0 ? [...current, ...extra] : current;
    });
  }, []);

  const persistUnlocks = useCallback(
    (game: GameState, nextProgress: PlayerProgress) => {
      const result = applyAchievementUnlocks(game, nextProgress);
      setGameState(result.game);
      setProgress(result.progress);
      stateRef.current = result.game;
      progressRef.current = result.progress;
      enqueueUnlocks(result.newly);
      return result;
    },
    [enqueueUnlocks, setGameState, setProgress],
  );

  const persistUnlocksRef = useRef(persistUnlocks);
  persistUnlocksRef.current = persistUnlocks;

  useEffect(() => {
    const repaired = repairGameState(stateRef.current);
    const normalized = normalizePlayerProgress(progressRef.current);
    persistUnlocksRef.current(repaired, normalized);
  }, []);

  const currentEventId = getCurrentEventId(gameState);
  const currentEvent = findEventById(currentEventId) ?? null;
  const currentAnswer = currentEvent
    ? gameState.answers.find((entry) => entry.eventId === currentEvent.id)
    : undefined;
  const activeSpecialEvent = findSpecialEventById(gameState.activeSpecialEventId) ?? null;
  const specialAnswer = getSpecialAnswer(gameState, gameState.activeSpecialEventId);
  const eventsInDay = gameState.selectedEventIds.length;
  const hasFinishedEvents =
    gameState.status === 'playing' &&
    eventsInDay > 0 &&
    gameState.currentEventIndex >= eventsInDay &&
    !gameState.activeSpecialEventId;
  const isLastEvent = eventsInDay > 0 && gameState.currentEventIndex === eventsInDay - 1;

  const startNewGame = useCallback(() => {
    const selected = getRandomEvents(events, EVENTS_PER_DAY, stateRef.current.selectedEventIds);
    setGameState({
      ...createInitialGameState('playing'),
      selectedEventIds: selected.map((event) => event.id),
      choiceOrderByEventId: createChoiceOrders(selected),
      morningMessage: pickMorningMessage(undefined, progressRef.current),
      eveningMessage: pickEveningMessage(),
    });
  }, [setGameState]);

  const continueGame = useCallback(
    () => gameState.status === 'playing' || gameState.status === 'completed',
    [gameState.status],
  );

  const updateStats = useCallback(
    (delta: GameChoice['effects']) => {
      const current = stateRef.current;
      persistUnlocks(
        {
          ...current,
          stats: applyEffects(current.stats, delta),
        },
        progressRef.current,
      );
    },
    [persistUnlocks],
  );

  const setCurrentEventIndex = useCallback(
    (index: number) => {
      setGameState((current) => ({
        ...current,
        currentEventIndex: index,
      }));
    },
    [setGameState],
  );

  const resolveChoice = useCallback(
    (event: GameEvent, choice: GameChoice) => {
      const current = stateRef.current;

      if (current.answers.some((entry) => entry.eventId === event.id)) {
        return;
      }

      const entry: GameAnswerHistory = {
        eventId: event.id,
        choiceId: choice.id,
        rating: choice.rating,
        effects: { ...choice.effects },
        timestamp: new Date().toISOString(),
        day: current.day,
      };

      persistUnlocks(
        {
          ...current,
          stats: applyEffects(current.stats, choice.effects),
          answers: [...current.answers, entry],
        },
        progressRef.current,
      );
    },
    [persistUnlocks],
  );

  const resolveSpecialChoice = useCallback(
    (event: SpecialEvent, choice: SpecialEventChoice) => {
      const current = stateRef.current;

      if (current.activeSpecialEventId !== event.id || getSpecialAnswer(current, event.id)) {
        return;
      }

      const entry: GameAnswerHistory = {
        eventId: event.id,
        choiceId: choice.id,
        rating: choice.rating,
        effects: { ...choice.effects },
        timestamp: new Date().toISOString(),
        day: current.day,
      };

      persistUnlocks(
        {
          ...current,
          stats: applyEffects(current.stats, choice.effects),
          specialAnswers: [...(current.specialAnswers ?? []), entry],
        },
        progressRef.current,
      );
    },
    [persistUnlocks],
  );

  const resolveSpecialContinue = useCallback(
    (event: SpecialEvent) => {
      resolveSpecialChoice(event, getImplicitSpecialChoice(event));
    },
    [resolveSpecialChoice],
  );

  const goToNextEvent = useCallback(() => {
    const current = stateRef.current;

    if (current.activeSpecialEventId || !canAdvance(current)) {
      return false;
    }

    const special = rollSpecialEvent(current);

    if (special) {
      persistUnlocks(
        {
          ...current,
          activeSpecialEventId: special.id,
          specialEventsShownToday: [...(current.specialEventsShownToday ?? []), special.id],
          specialChoiceOrders: {
            ...(current.specialChoiceOrders ?? {}),
            [special.id]: createSpecialChoiceOrder(special),
          },
        },
        addSeenSpecialEvent(progressRef.current, special.id),
      );
      return true;
    }

    setGameState({
      ...current,
      currentEventIndex: current.currentEventIndex + 1,
    });

    return true;
  }, [persistUnlocks, setGameState]);

  const finishSpecialEvent = useCallback(() => {
    const current = stateRef.current;
    const specialId = current.activeSpecialEventId;

    if (!specialId || !getSpecialAnswer(current, specialId)) {
      return false;
    }

    setGameState({
      ...current,
      activeSpecialEventId: null,
      currentEventIndex: current.currentEventIndex + 1,
    });

    return true;
  }, [setGameState]);

  const applyFinalization = useCallback(
    (current: GameState) => {
      const result = finalizeDayIfNeeded(current, progressRef.current);
      persistUnlocks(result.game, result.progress);
      return result.game.status === 'completed';
    },
    [persistUnlocks],
  );

  const completeDay = useCallback(() => {
    const current = stateRef.current;

    if (current.activeSpecialEventId || (!canCompleteDay(current) && current.status !== 'completed')) {
      return false;
    }

    return applyFinalization({
      ...current,
      status: 'completed',
    });
  }, [applyFinalization]);

  const finalizeDay = useCallback(() => {
    applyFinalization(stateRef.current);
  }, [applyFinalization]);

  const resetCurrentGame = useCallback(() => {
    setGameState(createInitialGameState('new'));
  }, [setGameState]);

  const resetAllProgress = useCallback(() => {
    setGameState(createInitialGameState('new'));
    setProgress(INITIAL_PLAYER_PROGRESS);
    setToastQueue([]);
    progressRef.current = INITIAL_PLAYER_PROGRESS;
  }, [setGameState, setProgress]);

  const dismissToast = useCallback(() => {
    setToastQueue((current) => current.slice(1));
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      gameState,
      progress,
      canContinue: gameState.status === 'playing' || gameState.status === 'completed',
      isPlaying: gameState.status === 'playing',
      isCompleted: gameState.status === 'completed',
      currentEvent,
      currentAnswer,
      activeSpecialEvent,
      specialAnswer,
      eventsInDay,
      isLastEvent,
      hasFinishedEvents,
      startNewGame,
      continueGame,
      updateStats,
      setCurrentEventIndex,
      resolveChoice,
      resolveSpecialChoice,
      resolveSpecialContinue,
      goToNextEvent,
      finishSpecialEvent,
      completeDay,
      finalizeDay,
      resetCurrentGame,
      resetAllProgress,
      resetGame: resetAllProgress,
    }),
    [
      completeDay,
      continueGame,
      currentAnswer,
      currentEvent,
      activeSpecialEvent,
      eventsInDay,
      finalizeDay,
      finishSpecialEvent,
      gameState,
      goToNextEvent,
      hasFinishedEvents,
      isLastEvent,
      progress,
      resetAllProgress,
      resetCurrentGame,
      resolveChoice,
      resolveSpecialChoice,
      resolveSpecialContinue,
      setCurrentEventIndex,
      specialAnswer,
      startNewGame,
      updateStats,
    ],
  );

  return createElement(
    GameContext.Provider,
    { value },
    createElement(
      Fragment,
      null,
      children,
      createElement(AchievementToastHost, {
        items: toastQueue,
        onDismiss: dismissToast,
      }),
    ),
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }

  return context;
}

function repairGameState(current: GameState): GameState {
  let next = normalizeGameState(current);

  if (next.status !== 'playing') {
    return next;
  }

  if (next.selectedEventIds.length === 0) {
    const fallback = events.slice(0, EVENTS_PER_DAY);
    next = {
      ...next,
      selectedEventIds: fallback.map((event) => event.id),
      choiceOrderByEventId: {
        ...next.choiceOrderByEventId,
        ...createChoiceOrders(fallback),
      },
    };
  }

  const missingOrders = next.selectedEventIds
    .map((eventId) => findEventById(eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event))
    .filter((event) => !next.choiceOrderByEventId[event.id]?.length);

  if (missingOrders.length > 0) {
    next = {
      ...next,
      choiceOrderByEventId: {
        ...next.choiceOrderByEventId,
        ...createChoiceOrders(missingOrders),
      },
    };
  }

  const validIndex = getNextValidEventIndex(next);

  if (validIndex !== next.currentEventIndex && !next.activeSpecialEventId) {
    next = {
      ...next,
      currentEventIndex: validIndex,
    };
  }

  if (next.activeSpecialEventId && !findSpecialEventById(next.activeSpecialEventId)) {
    next = {
      ...next,
      activeSpecialEventId: null,
    };
  }

  if (next.status === 'playing' && !next.morningMessage) {
    next = {
      ...next,
      morningMessage: pickMorningMessage(),
      eveningMessage: next.eveningMessage || pickEveningMessage(),
    };
  }

  return next;
}

function normalizeGameState(current: GameState): GameState {
  const next = {
    ...current,
    dayStartStats: current.dayStartStats ?? { ...INITIAL_GAME_STATE.stats },
    choiceOrderByEventId: current.choiceOrderByEventId ?? {},
    isDayFinalized: current.isDayFinalized ?? false,
    lastScoreIsRecord: current.lastScoreIsRecord ?? false,
    lastUnlockedAchievementIds: Array.isArray(current.lastUnlockedAchievementIds)
      ? current.lastUnlockedAchievementIds
      : [],
    activeSpecialEventId: current.activeSpecialEventId ?? null,
    specialEventsShownToday: Array.isArray(current.specialEventsShownToday)
      ? current.specialEventsShownToday
      : [],
    specialAnswers: Array.isArray(current.specialAnswers) ? current.specialAnswers : [],
    specialChoiceOrders: current.specialChoiceOrders ?? {},
    morningMessage: current.morningMessage ?? '',
    eveningMessage: current.eveningMessage ?? '',
  };

  return migrateLegacyBudget(next);
}

function migrateLegacyBudget(state: GameState): GameState {
  const legacyBudget = 500000;
  const currentBudget = INITIAL_GAME_STATE.stats.budget;

  if (state.status === 'completed' || state.dayStartStats.budget !== legacyBudget) {
    return state;
  }

  const spent = legacyBudget - state.stats.budget;

  return {
    ...state,
    dayStartStats: { ...state.dayStartStats, budget: currentBudget },
    stats: { ...state.stats, budget: currentBudget - spent },
  };
}

function canAdvance(state: GameState): boolean {
  if (state.status !== 'playing') {
    return false;
  }

  const eventId = getCurrentEventId(state);

  if (!eventId) {
    return false;
  }

  const answered = state.answers.some((entry) => entry.eventId === eventId);
  const lastIndex = state.selectedEventIds.length - 1;

  return answered && state.currentEventIndex < lastIndex;
}

function canCompleteDay(state: GameState): boolean {
  if (state.status === 'completed') {
    return true;
  }

  if (state.status !== 'playing' || state.selectedEventIds.length === 0) {
    return false;
  }

  if (state.currentEventIndex >= state.selectedEventIds.length) {
    return true;
  }

  const eventId = getCurrentEventId(state);
  const lastIndex = state.selectedEventIds.length - 1;
  const answered = Boolean(eventId && state.answers.some((entry) => entry.eventId === eventId));

  return state.currentEventIndex >= lastIndex && answered;
}

function addSeenSpecialEvent(progress: PlayerProgress, eventId: string): PlayerProgress {
  const normalized = normalizePlayerProgress(progress);

  if (normalized.seenSpecialEventIds.includes(eventId)) {
    return normalized;
  }

  return {
    ...normalized,
    seenSpecialEventIds: [...normalized.seenSpecialEventIds, eventId],
  };
}
