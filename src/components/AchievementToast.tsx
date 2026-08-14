import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types/game';
import type { AchievementDefinition, GameSettings } from '../types/game';
import { notifyAchievementUnlock } from '../utils/achievements';
import { notifyVKHaptic } from '../integrations/vk/vkBridge';
import { AchievementIcon } from './AchievementIcon';
import styles from './AchievementToast.module.css';

const TOAST_DURATION_MS = 4500;

interface AchievementToastHostProps {
  items: AchievementDefinition[];
  onDismiss: () => void;
}

export function AchievementToastHost({ items, onDismiss }: AchievementToastHostProps) {
  const current = items[0];

  if (!current) {
    return null;
  }

  return <AchievementToast key={current.id} achievement={current} onDismiss={onDismiss} />;
}

function AchievementToast({
  achievement,
  onDismiss,
}: {
  achievement: AchievementDefinition;
  onDismiss: () => void;
}) {
  const [settings] = useLocalStorage<GameSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);

  useEffect(() => {
    notifyAchievementUnlock(achievement);
    notifyVKHaptic('success');
    const timeout = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [achievement, onDismiss]);

  return (
    <div className={styles.host}>
      <aside
        className={`${styles.toast} ${settings.reduceMotion ? styles.static : ''}`}
        role="status"
        aria-live="polite"
        aria-label={`Новое достижение: ${achievement.title}`}
      >
        <span className={styles.glow} aria-hidden="true" />
        <span className={styles.icon} aria-hidden="true">
          <AchievementIcon name={achievement.icon} size={22} />
        </span>
        <div className={styles.body}>
          <p className={styles.kicker}>Новое достижение!</p>
          <p className={styles.title}>{achievement.title}</p>
          <p className={styles.description}>{achievement.description}</p>
          {achievement.vasilyText ? <p className={styles.quote}>«{achievement.vasilyText}»</p> : null}
        </div>
        <button type="button" className={styles.close} onClick={onDismiss} aria-label="Закрыть уведомление">
          <X size={16} />
        </button>
      </aside>
    </div>
  );
}
