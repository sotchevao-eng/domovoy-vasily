import { Lock } from 'lucide-react';
import type { AchievementDefinition, UnlockedAchievement } from '../types/game';
import { formatUnlockDate } from '../utils/achievements';
import { AchievementIcon } from './AchievementIcon';
import styles from './AchievementCard.module.css';

interface AchievementCardProps {
  achievement: AchievementDefinition;
  unlocked?: UnlockedAchievement;
  compact?: boolean;
}

export function AchievementCard({ achievement, unlocked, compact = false }: AchievementCardProps) {
  const isUnlocked = Boolean(unlocked);
  const isHiddenLocked = Boolean(achievement.hidden) && !isUnlocked;
  const title = isHiddenLocked ? '???' : achievement.title;
  const description = isHiddenLocked ? 'Секретное достижение' : achievement.description;
  const dateLabel = unlocked ? formatUnlockDate(unlocked.unlockedAt) : '';

  return (
    <article
      className={`${styles.card} ${isUnlocked ? styles.unlocked : styles.locked} ${compact ? styles.compact : ''}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {isUnlocked ? <AchievementIcon name={achievement.icon} /> : <Lock size={20} />}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {isUnlocked && achievement.vasilyText ? (
          <p className={styles.quote}>«{achievement.vasilyText}»</p>
        ) : null}
        <span className={styles.status}>
          {isUnlocked ? (dateLabel ? `Получено ${dateLabel}` : 'Получено') : 'Ещё не получено'}
        </span>
      </div>
    </article>
  );
}
