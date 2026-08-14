import type { ChoiceRating, EventEffects } from '../types/game';
import { EFFECT_ENTRIES, formatEffectValue } from '../utils/scoring';
import { ChoiceButton } from './ChoiceButton';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  rating?: ChoiceRating;
  title?: string;
  result: string;
  vasilyReaction?: string;
  effects?: EventEffects;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

const RATING_TITLE: Record<ChoiceRating, string> = {
  good: 'Хорошее решение',
  neutral: 'Решение с последствиями',
  bad: 'Не самое удачное решение',
};

export function ResultCard({
  rating,
  title,
  result,
  vasilyReaction,
  effects,
  onNext,
  nextLabel = 'Следующее событие',
  nextDisabled = false,
}: ResultCardProps) {
  const heading = title ?? (rating ? RATING_TITLE[rating] : 'Результат');
  const visibleEffects = EFFECT_ENTRIES.filter((entry) => effects?.[entry.key] !== undefined);

  return (
    <article className={`${styles.card} ${rating ? styles[rating] : ''}`}>
      <p className={styles.kicker}>{heading}</p>
      <p className={styles.summary}>{result}</p>

      {visibleEffects.length > 0 ? (
        <ul className={styles.stats}>
          {visibleEffects.map(({ key, label }) => {
            const value = effects?.[key] ?? 0;

            return (
              <li key={key}>
                <span>{label}</span>
                <strong className={value < 0 ? styles.negative : styles.positive}>
                  {formatEffectValue(key, value)}
                </strong>
              </li>
            );
          })}
        </ul>
      ) : null}

      {vasilyReaction ? (
        <p className={styles.vasily}>
          <span>Василий</span>
          «{vasilyReaction}»
        </p>
      ) : null}

      {onNext ? (
        <div className={styles.next}>
          <ChoiceButton variant="primary" onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </ChoiceButton>
        </div>
      ) : null}
    </article>
  );
}
