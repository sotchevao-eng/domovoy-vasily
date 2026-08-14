import { useMemo, useState } from 'react';
import { AchievementCard } from '../components/AchievementCard';
import { Layout } from '../components/Layout';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  achievements,
} from '../data/achievements';
import { useGame } from '../hooks/useGame';
import type { AchievementCategory } from '../types/game';
import { getUnlockedAchievementMap } from '../utils/achievements';
import styles from './AchievementsPage.module.css';

const FILTERS: Array<{ id: 'all' | AchievementCategory; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'house', label: ACHIEVEMENT_CATEGORY_LABELS.house },
  { id: 'residents', label: ACHIEVEMENT_CATEGORY_LABELS.residents },
  { id: 'decisions', label: ACHIEVEMENT_CATEGORY_LABELS.decisions },
  { id: 'rating', label: ACHIEVEMENT_CATEGORY_LABELS.rating },
  { id: 'experience', label: ACHIEVEMENT_CATEGORY_LABELS.experience },
  { id: 'secret', label: ACHIEVEMENT_CATEGORY_LABELS.secret },
];

export function AchievementsPage() {
  const { progress } = useGame();
  const [filter, setFilter] = useState<'all' | AchievementCategory>('all');
  const unlockedMap = getUnlockedAchievementMap(progress);
  const unlockedCount = unlockedMap.size;
  const total = achievements.length;
  const percent = total === 0 ? 0 : Math.round((unlockedCount / total) * 100);

  const visible = useMemo(() => {
    const filtered =
      filter === 'all' ? achievements : achievements.filter((item) => item.category === filter);
    const unlocked = filtered.filter((item) => unlockedMap.has(item.id));
    const locked = filtered.filter((item) => !unlockedMap.has(item.id));
    return [...unlocked, ...locked];
  }, [filter, unlockedMap]);

  return (
    <Layout title="Достижения">
      <section className={styles.panel}>
        <h1>Достижения</h1>
        <p className={styles.lead}>Посмотрим, чему Василий уже готов доверить тебя без присмотра.</p>
        {unlockedCount === 0 ? (
          <p className={styles.empty}>Пока полка достижений пустовата. Василий уверен — ненадолго.</p>
        ) : null}

        <div className={styles.progressBlock}>
          <div className={styles.progressLabel}>
            <span>
              Получено {unlockedCount} из {total}
            </span>
            <span>{percent}%</span>
          </div>
          <div
            className={styles.bar}
            role="progressbar"
            aria-label="Прогресс достижений"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={unlockedCount}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className={styles.filters} role="tablist" aria-label="Категории достижений">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`${styles.filter} ${filter === item.id ? styles.filterActive : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {visible.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedMap.get(achievement.id)}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}
