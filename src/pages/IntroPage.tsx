import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { Vasily } from '../components/Vasily';
import { ROUTES } from '../config/appConfig';
import { useGame } from '../hooks/useGame';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types/game';
import type { GameSettings } from '../types/game';
import { shouldReduceMotion } from '../utils/motion';
import styles from './page.module.css';

const LINES = [
  {
    paragraphs: [
      'Привет! Я Василий. Уже много лет присматриваю за этим домом.',
      'Но дом большой, жильцов много, а происшествия почему-то никогда не заканчиваются.',
      'Поможешь мне сегодня?',
    ],
    action: 'Конечно, Василий!',
  },
  {
    paragraphs: [
      'Тогда запомни главное: иногда самое дешёвое решение оказывается не самым правильным.',
      'Следи за состоянием дома, комфортом соседей, бюджетом и своей репутацией.',
    ],
    action: 'Начать день',
  },
];

export function IntroPage() {
  const [step, setStep] = useState(0);
  const { startNewGame } = useGame();
  const navigate = useNavigate();
  const [settings] = useLocalStorage<GameSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const reduceMotion = shouldReduceMotion(settings.reduceMotion);
  const replica = LINES[step] ?? {
    paragraphs: ['Поможешь мне сегодня?'],
    action: 'Конечно, Василий!',
  };

  const continueIntro = () => {
    if (step < LINES.length - 1) {
      setStep(step + 1);
      return;
    }

    startNewGame();
    navigate(ROUTES.play);
  };

  return (
    <Layout title="Знакомство">
      <div className={styles.stack}>
        <section className={styles.panel}>
          <div className={styles.center}>
            <Vasily size="md" caption="Домовой Василий" pose="explain" reduceMotion={reduceMotion} />
          </div>
          <article
            className={`${styles.speech} ${reduceMotion ? '' : styles.speechIn}`}
            key={step}
            aria-label="Реплика Василия"
          >
            <p className={styles.speaker}>Василий</p>
            {replica.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </article>
          <div className={styles.actions}>
            <Button variant="primary" onClick={continueIntro}>
              {replica.action}
            </Button>
            <Button to="/">На главную</Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
