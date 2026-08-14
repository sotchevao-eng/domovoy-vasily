import { Clock, MapPin, MessageCircle } from 'lucide-react';
import { EVENT_CATEGORY_META } from '../data/categories';
import type { GameChoice, GameEvent } from '../types/game';
import { ChoiceButton } from './ChoiceButton';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: GameEvent;
  time?: string;
  choices?: GameChoice[];
  selectedChoiceId?: string;
  onChoose: (choice: GameChoice) => void;
}

export function EventCard({ event, time, choices = event.choices, selectedChoiceId, onChoose }: EventCardProps) {
  const category = EVENT_CATEGORY_META[event.category];
  const CategoryIcon = category.icon;
  const locked = Boolean(selectedChoiceId);

  return (
    <article className={styles.card}>
      <div className={styles.meta}>
        <span>
          <Clock size={14} />
          {time ?? event.time}
        </span>
        <span>
          <MapPin size={14} />
          {event.location}
        </span>
        <span>
          <CategoryIcon size={14} />
          {category.label}
        </span>
      </div>

      <h2>{event.title}</h2>
      <p className={styles.text}>{event.description}</p>

      <blockquote className={styles.quote}>
        <MessageCircle size={16} aria-hidden="true" />
        <p>{event.vasilyText}</p>
      </blockquote>

      <div className={styles.choices} role="group" aria-label="Варианты решения">
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
    </article>
  );
}
