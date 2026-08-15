import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { EventCard } from '../components/EventCard';
import { HouseMap } from '../components/HouseMap';
import { Layout } from '../components/Layout';
import { ResultCard } from '../components/ResultCard';
import { SpecialEventCard } from '../components/SpecialEventCard';
import { StatsBar } from '../components/StatsBar';
import { Vasily, type VasilyPose } from '../components/Vasily';
import { getDayTime } from '../data/day';
import { getEventZoneMarker } from '../data/zones';
import { ROUTES } from '../config/appConfig';
import { playSound } from '../services/soundService';
import { useGame } from '../hooks/useGame';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types/game';
import type { GameSettings } from '../types/game';
import { getZoneMoods } from '../utils/houseMood';
import { orderChoices } from '../utils/events';
import { orderSpecialChoices } from '../utils/specialEvents';
import { getDecisionReaction } from '../utils/vasily';
import { shouldReduceMotion } from '../utils/motion';
import styles from './GamePage.module.css';

export function GamePage() {
  const navigate = useNavigate();
  const {
    gameState,
    isPlaying,
    isCompleted,
    currentEvent,
    currentAnswer,
    activeSpecialEvent,
    specialAnswer,
    eventsInDay,
    isLastEvent,
    hasFinishedEvents,
    resolveChoice,
    resolveSpecialChoice,
    resolveSpecialContinue,
    goToNextEvent,
    finishSpecialEvent,
    completeDay,
    setCurrentEventIndex,
  } = useGame();
  const [settings] = useLocalStorage<GameSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const [advancing, setAdvancing] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageKey = activeSpecialEvent?.id ?? currentEvent?.id ?? 'empty';

  const reduceMotion = shouldReduceMotion(settings.reduceMotion);

  useEffect(() => {
    if (hasFinishedEvents) {
      completeDay();
      navigate(ROUTES.result, { replace: true });
    }
  }, [completeDay, hasFinishedEvents, navigate]);

  useEffect(() => {
    setAdvancing(false);
    stageRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [gameState.currentEventIndex, gameState.activeSpecialEventId, reduceMotion]);

  useEffect(() => {
    if (currentEvent?.id || activeSpecialEvent?.id) {
      playSound('new-event');
    }
  }, [activeSpecialEvent?.id, currentEvent?.id]);

  if (isCompleted) {
    return <Navigate to={ROUTES.result} replace />;
  }

  if (!isPlaying) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const selectedChoice = currentEvent?.choices.find((choice) => choice.id === currentAnswer?.choiceId);
  const specialChoice = activeSpecialEvent?.choices?.find((choice) => choice.id === specialAnswer?.choiceId);
  const eventNumber = Math.min(gameState.currentEventIndex + 1, Math.max(eventsInDay, 1));
  const progressPercent = eventsInDay === 0 ? 0 : Math.round((eventNumber / eventsInDay) * 100);
  const showMorning =
    Boolean(gameState.morningMessage) &&
    gameState.currentEventIndex === 0 &&
    !currentAnswer &&
    !activeSpecialEvent;
  const activeZone = activeSpecialEvent?.zone ?? currentEvent?.zone ?? null;
  const emergency = Boolean(!activeSpecialEvent && currentEvent?.category === 'emergency');
  const zoneMarker = getEventZoneMarker(activeSpecialEvent?.id ?? currentEvent?.id);
  const zoneMoods = getZoneMoods(gameState);
  const decisionRating = specialChoice?.rating ?? specialAnswer?.rating ?? selectedChoice?.rating;
  const vasilyPose: VasilyPose = decisionRating === 'good'
    ? 'praise'
    : decisionRating === 'bad'
      ? 'grumble'
      : showMorning
        ? 'think'
        : emergency
          ? 'worry'
          : activeSpecialEvent
            ? 'explain'
            : 'wait';

  const handleNext = () => {
    if (advancing) {
      return;
    }

    if (activeSpecialEvent) {
      if (!specialAnswer) {
        return;
      }

      setAdvancing(true);

      if (!finishSpecialEvent()) {
        setAdvancing(false);
      }

      return;
    }

    if (!currentAnswer) {
      return;
    }

    setAdvancing(true);

    if (isLastEvent) {
      if (completeDay()) {
        navigate(ROUTES.result);
        return;
      }

      setAdvancing(false);
      return;
    }

    if (!goToNextEvent()) {
      setAdvancing(false);
    }
  };

  return (
    <Layout title="Дом Василия">
      <div className={styles.page}>
        <h1 className={styles.dayTitle}>Сегодня в доме</h1>
        <p className={styles.progressLabel}>
          Событие {eventNumber} из {eventsInDay || 10}
        </p>
        <div className={styles.progressBlock} aria-hidden="true">
          <div className={styles.track}>
            <span className={styles.fill} style={{ width: `${progressPercent}%` }} />
          </div>
          <div className={styles.dots}>
            {Array.from({ length: eventsInDay }, (_, index) => {
              const markerClass =
                index < gameState.currentEventIndex
                  ? styles.done
                  : index === gameState.currentEventIndex
                    ? styles.current
                    : styles.todo;

              return <span key={index} className={`${styles.dot} ${markerClass}`} />;
            })}
          </div>
        </div>
        <StatsBar stats={gameState.stats} />

        <div className={styles.layout}>
          <aside className={styles.scene}>
            <HouseMap
              activeZone={activeZone}
              emergency={emergency}
              marker={zoneMarker}
              reduceMotion={reduceMotion}
              zoneMoods={zoneMoods}
            />
            <Vasily pose={vasilyPose} reduceMotion={reduceMotion} caption="" />
          </aside>

          <div
            ref={stageRef}
            className={`${styles.stage} ${reduceMotion ? '' : styles.animated}`}
            key={stageKey}
          >
            {activeSpecialEvent ? (
              <>
                <SpecialEventCard
                  event={activeSpecialEvent}
                  choices={orderSpecialChoices(
                    activeSpecialEvent,
                    gameState.specialChoiceOrders?.[activeSpecialEvent.id],
                  )}
                  selectedChoiceId={specialAnswer?.choiceId}
                  resolved={Boolean(specialAnswer)}
                  reduceMotion={reduceMotion}
                  onChoose={(choice) => {
                    playSound(
                      choice.rating === 'good'
                        ? 'good-choice'
                        : choice.rating === 'bad'
                          ? 'bad-choice'
                          : 'neutral-choice',
                    );
                    resolveSpecialChoice(activeSpecialEvent, choice);
                  }}
                  onContinue={() => resolveSpecialContinue(activeSpecialEvent)}
                />
                {specialAnswer ? (
                  <ResultCard
                    rating={specialChoice?.rating ?? specialAnswer.rating}
                    title="Небольшой итог"
                    result={
                      specialChoice?.result ??
                      activeSpecialEvent.result ??
                      activeSpecialEvent.description
                    }
                    effects={specialAnswer.effects}
                    onNext={handleNext}
                    nextLabel={isLastEvent ? 'Завершить день' : 'Следующее событие'}
                    nextDisabled={advancing}
                  />
                ) : null}
              </>
            ) : currentEvent ? (
              <>
                <EventCard
                  event={currentEvent}
                  time={getDayTime(gameState.currentEventIndex)}
                  choices={orderChoices(currentEvent, gameState.choiceOrderByEventId?.[currentEvent.id])}
                  selectedChoiceId={currentAnswer?.choiceId}
                  onChoose={(choice) => {
                    playSound(
                      choice.rating === 'good'
                        ? 'good-choice'
                        : choice.rating === 'bad'
                          ? 'bad-choice'
                          : 'neutral-choice',
                    );
                    resolveChoice(currentEvent, choice);
                  }}
                />
                {selectedChoice ? (
                  <ResultCard
                    rating={selectedChoice.rating}
                    result={selectedChoice.result}
                    vasilyReaction={getDecisionReaction(
                      selectedChoice.rating,
                      selectedChoice.vasilyReaction,
                    )}
                    effects={selectedChoice.effects}
                    onNext={handleNext}
                    nextLabel={isLastEvent ? 'Завершить день' : 'Следующее событие'}
                    nextDisabled={advancing}
                  />
                ) : null}
              </>
            ) : hasFinishedEvents ? (
              <section className={styles.finished}>
                <h2>День подходит к вечеру</h2>
                <p>Василий собирает итоги. Ещё мгновение...</p>
              </section>
            ) : (
              <section className={styles.finished}>
                <h2>Кажется, Василий потерял одну страницу из своего блокнота.</h2>
                <p>Страница события не нашлась, но дом никуда не делся. Можно идти дальше.</p>
                <div className={styles.missingActions}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (isLastEvent) {
                        if (completeDay()) {
                          navigate(ROUTES.result);
                        }
                        return;
                      }

                      setCurrentEventIndex(gameState.currentEventIndex + 1);
                    }}
                  >
                    Продолжить
                  </Button>
                  <Button to={ROUTES.home}>На главную</Button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
