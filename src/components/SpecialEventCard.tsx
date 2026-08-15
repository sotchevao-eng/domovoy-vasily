import { Sparkles } from 'lucide-react';
import type { SpecialEvent, SpecialEventChoice } from '../types/game';
import { ChoiceButton } from './ChoiceButton';
import styles from './SpecialEventCard.module.css';

interface SpecialEventCardProps {
  event: SpecialEvent;
  choices?: SpecialEventChoice[];
  selectedChoiceId?: string;
  resolved?: boolean;
  reduceMotion?: boolean;
  onChoose: (choice: SpecialEventChoice) => void;
  onContinue: () => void;
}

export function SpecialEventCard({
  event,
  choices = event.choices ?? [],
  selectedChoiceId,
  resolved = false,
  reduceMotion = false,
  onChoose,
  onContinue,
}: SpecialEventCardProps) {
  const locked = Boolean(selectedChoiceId) || resolved;
  const hasChoices = event.type === 'choice' && choices.length > 0;

  return (
    <article className={`${styles.card} ${reduceMotion ? '' : styles.animated}`}>
      <p className={styles.kicker}>
        <Sparkles size={14} aria-hidden="true" />
        Небольшое событие
      </p>
      <h2>{event.title}</h2>
      <p className={styles.text}>{event.description}</p>

      {event.vasilyText ? (
        <blockquote className={styles.quote}>
          <p>{event.vasilyText}</p>
        </blockquote>
      ) : null}

      {hasChoices ? (
        <div className={styles.choices} role="group" aria-label="Варианты небольшого события">
          {choices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              selected={selectedChoiceId === choice.id}
              disabled={locked}
              onClick={() => onChoose(choice)}
            >
              {choice.text}
            </ChoiceButton>
          ))}
        </div>
      ) : null}

      {!hasChoices && !resolved ? (
        <div className={styles.continue}>
          <ChoiceButton variant="primary" onClick={onContinue}>
            Продолжить
          </ChoiceButton>
        </div>
      ) : null}
    </article>
  );
}
