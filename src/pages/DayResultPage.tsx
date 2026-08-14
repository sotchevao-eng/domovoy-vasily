import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AchievementCard } from '../components/AchievementCard';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { Vasily } from '../components/Vasily';
import { RANK_SCALE, getRankByScore } from '../data/ranks';
import { ROUTES } from '../config/appConfig';
import { notifyVKHaptic, shareVKResult } from '../integrations/vk/vkBridge';
import { getShareText } from '../integrations/vk/share';
import { useVK } from '../integrations/vk/useVK';
import { useGame } from '../hooks/useGame';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types/game';
import type { GameSettings, StatKey } from '../types/game';
import { getNewAchievementsForDay, getUnlockedAchievementMap } from '../utils/achievements';
import { getAnswerStats } from '../utils/answers';
import { shouldReduceMotion } from '../utils/motion';
import { playSound } from '../services/soundService';
import {
  EFFECT_ENTRIES,
  calculateDayScore,
  formatBudget,
  formatEffectValue,
  getWeakestStatAdvice,
} from '../utils/scoring';
import styles from './DayResultPage.module.css';

export function DayResultPage() {
  const navigate = useNavigate();
  const { gameState, progress, isPlaying, isCompleted, startNewGame, finalizeDay } = useGame();
  const { canShare } = useVK();
  const [settings] = useLocalStorage<GameSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const reduceMotion = shouldReduceMotion(settings.reduceMotion);

  useEffect(() => {
    if (isCompleted) {
      finalizeDay();
      playSound('day-complete');
      notifyVKHaptic('success');
    }
  }, [finalizeDay, isCompleted]);

  if (!isCompleted) {
    return <Navigate to={isPlaying ? ROUTES.play : ROUTES.home} replace />;
  }

  const dayAnswers = gameState.answers.filter((answer) => answer.day === gameState.day);
  const answerStats = getAnswerStats(dayAnswers);
  const score = calculateDayScore(gameState);
  const rank = getRankByScore(score);
  const advice = getWeakestStatAdvice(gameState.stats);
  const startStats = gameState.dayStartStats ?? gameState.stats;
  const newAchievements = getNewAchievementsForDay(gameState);
  const unlockedMap = getUnlockedAchievementMap(progress);

  const handlePlayAgain = () => {
    startNewGame();
    navigate(ROUTES.play);
  };

  return (
    <Layout title="Итог дня">
      <div className={styles.page}>
        <section className={`${styles.scoreCard} ${styles[rank.id] ?? ''}`} aria-label="Итоговый рейтинг">
          {gameState.lastScoreIsRecord ? <p className={styles.record}>Новый рекорд!</p> : null}
          <p className={styles.score}>
            <AnimatedScore value={score} reduceMotion={reduceMotion} />
            <span> / 100</span>
          </p>
          <p className={styles.rank}>
            <span>{rank.icon}</span>
            {rank.title}
          </p>
          <p className={styles.quote}>«{rank.vasilyText}»</p>
          <ScoreScale score={score} />
        </section>

        <div className={styles.hero}>
          <Vasily
            size="md"
            caption={gameState.eveningMessage || rank.vasilyText}
            pose={score >= 80 ? 'celebrate' : score < 50 ? 'tired' : 'wait'}
            reduceMotion={reduceMotion}
          />
          <p className={styles.kicker}>Рабочий день завершён</p>
        </div>

        <section className={styles.panel} aria-label="Показатели дома">
          <h2>Итоговые показатели</h2>
          <div className={styles.statGrid}>
            {EFFECT_ENTRIES.map(({ key, label }) => (
              <StatResultCard
                key={key}
                statKey={key}
                label={label}
                start={startStats[key]}
                end={gameState.stats[key]}
              />
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Решения дня</h2>
          <ul className={styles.counts}>
            <li>Хороших решений — {answerStats.good}</li>
            <li>Спорных решений — {answerStats.neutral}</li>
            <li>Неудачных решений — {answerStats.bad}</li>
          </ul>
          {advice ? <p className={styles.advice}>«{advice}»</p> : null}
        </section>

        {newAchievements.length > 0 ? (
          <section className={styles.panel} aria-label="Новые достижения">
            <h2>Новые достижения</h2>
            <div className={styles.achievementGrid}>
              {newAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlockedMap.get(achievement.id)}
                  compact
                />
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.actions}>
          <Button variant="primary" onClick={handlePlayAgain}>
            Сыграть ещё раз
          </Button>
          {canShare ? (
            <Button
              onClick={() => {
                void shareVKResult({ score, rank: rank.title });
              }}
            >
              Поделиться результатом
            </Button>
          ) : null}
          <Button to={ROUTES.achievements}>Достижения</Button>
          <Button to={ROUTES.home}>На главную</Button>
        </div>
        {canShare ? <p className={styles.shareHint}>{getShareText({ score, rank: rank.title })}</p> : null}
      </div>
    </Layout>
  );
}

function StatResultCard({
  statKey,
  label,
  start,
  end,
}: {
  statKey: StatKey;
  label: string;
  start: number;
  end: number;
}) {
  const delta = end - start;

  return (
    <article className={styles.statCard}>
      <p>{label}</p>
      <strong>{formatStat(statKey, end)}</strong>
      {delta !== 0 ? (
        <span className={delta > 0 ? styles.plus : styles.minus}>{formatEffectValue(statKey, delta)}</span>
      ) : (
        <span className={styles.flat}>без изменений</span>
      )}
    </article>
  );
}

function ScoreScale({ score }: { score: number }) {
  return (
    <div className={styles.scale} aria-hidden="true">
      <span className={styles.marker} style={{ left: `${score}%` }} />
      {RANK_SCALE.map((point) => (
        <span key={point} className={styles.tick} style={{ left: `${point}%` }}>
          {point}
        </span>
      ))}
    </div>
  );
}

function AnimatedScore({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return;
    }

    const startedAt = performance.now();
    const duration = 900;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(value * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, value]);

  return <b>{shown}</b>;
}

function formatStat(key: StatKey, value: number): string {
  return key === 'budget' ? formatBudget(value) : String(value);
}
