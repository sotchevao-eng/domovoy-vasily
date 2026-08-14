import { Heart, Star, Wallet, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { GameSettings, GameStats, StatKey } from '../types/game';
import { DEFAULT_SETTINGS, INITIAL_GAME_STATE, SETTINGS_STORAGE_KEY } from '../types/game';
import { formatBudget, formatEffectValue } from '../utils/scoring';
import { shouldReduceMotion } from '../utils/motion';
import styles from './StatsBar.module.css';

interface StatsBarProps {
  stats?: GameStats;
}

const METER_STATS = [
  {
    key: 'comfort',
    label: 'Комфорт жителей',
    icon: Heart,
    tone: 'terracotta',
  },
  {
    key: 'building',
    label: 'Состояние дома',
    icon: Wrench,
    tone: 'brown',
  },
  {
    key: 'reputation',
    label: 'Репутация',
    icon: Star,
    tone: 'gold',
  },
] as const;

export function StatsBar({ stats = INITIAL_GAME_STATE.stats }: StatsBarProps) {
  const [settings] = useLocalStorage<GameSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const previousRef = useRef(stats);
  const [deltas, setDeltas] = useState<Partial<GameStats> | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const previous = previousRef.current;
    const nextDeltas: Partial<GameStats> = {};
    let changed = false;

    (['comfort', 'building', 'budget', 'reputation'] as const).forEach((key) => {
      const diff = stats[key] - previous[key];
      if (diff !== 0) {
        nextDeltas[key] = diff;
        changed = true;
      }
    });

    previousRef.current = stats;

    if (!changed || shouldReduceMotion(settings.reduceMotion)) {
      return;
    }

    setDeltas(nextDeltas);
    setPulse(true);
    const timeout = window.setTimeout(() => {
      setDeltas(null);
      setPulse(false);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [settings.reduceMotion, stats]);

  return (
    <section
      className={`${styles.bar} ${shouldReduceMotion(settings.reduceMotion) ? styles.reduceMotion : ''}`}
      aria-label="Показатели дома"
    >
      {METER_STATS.map(({ key, label, icon: Icon, tone }) => {
        const value = Math.max(0, Math.min(100, stats[key]));

        return (
          <article key={key} className={styles.item}>
            <DeltaBadge value={deltas?.[key]} />
            <div className={styles.head}>
              <span className={`${styles.icon} ${styles[tone]}`} aria-hidden="true">
                <Icon size={16} />
              </span>
              <span className={styles.label}>{label}</span>
            </div>
            <p className={`${styles.value} ${pulse && deltas?.[key] ? styles.pulse : ''}`}>
              {value}
              <span> / 100</span>
            </p>
            <div className={styles.track} aria-hidden="true">
              <span className={`${styles.fill} ${styles[tone]}`} style={{ width: `${value}%` }} />
            </div>
          </article>
        );
      })}

      <article className={`${styles.item} ${styles.budget}`}>
        <DeltaBadge value={deltas?.budget} stat="budget" />
        <div className={styles.head}>
          <span className={`${styles.icon} ${styles.green}`} aria-hidden="true">
            <Wallet size={16} />
          </span>
          <span className={styles.label}>Бюджет ТСЖ</span>
        </div>
        <p className={`${styles.budgetValue} ${pulse && deltas?.budget ? styles.pulse : ''}`}>
          {formatBudget(stats.budget)}
        </p>
      </article>
    </section>
  );
}

function DeltaBadge({ value, stat = 'comfort' }: { value?: number; stat?: StatKey }) {
  if (!value) {
    return null;
  }

  return (
    <span className={`${styles.delta} ${value < 0 ? styles.deltaDown : styles.deltaUp}`}>
      {formatEffectValue(stat, value)}
    </span>
  );
}
