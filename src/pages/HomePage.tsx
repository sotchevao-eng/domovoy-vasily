import { BookOpen, Play, RotateCcw, Settings, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { SiteBackLink } from '../components/SiteBackLink';
import { Vasily } from '../components/Vasily';
import { VKNotice } from '../components/VKNotice';
import { VKPlayerChip } from '../components/VKPlayerChip';
import { IS_VK_MODE, IS_WEBSITE_MODE, ROUTES } from '../config/appConfig';
import { useVK } from '../integrations/vk/useVK';
import { achievements } from '../data/achievements';
import { getRankById } from '../data/ranks';
import { useGame } from '../hooks/useGame';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const { canContinue, isPlaying, isCompleted, progress } = useGame();
  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const { user } = useVK();
  const continueTo = isCompleted ? ROUTES.result : ROUTES.play;
  const bestRank = getRankById(progress.bestRank);
  const hasRecords = progress.completedDaysCount > 0 || progress.bestScore !== null;
  const unlockedCount = progress.unlockedAchievements?.length ?? 0;
  const vasilyCaption = IS_VK_MODE
    ? user?.firstName
      ? `Привет, ${user.firstName}! Василий уже ждёт.`
      : 'Василий уже ждёт.'
    : 'Добро пожаловать домой.';

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <main className={styles.card}>
        <VKNotice />
        <VKPlayerChip />
        <p className={styles.badge}>{IS_WEBSITE_MODE ? 'Игра ТСЖ «Васильевский»' : 'Уютный симулятор дома'}</p>
        <div className={styles.hero}>
          <Vasily size="lg" caption={vasilyCaption} />
        </div>

        <h1 className={styles.title}>Домовой Василий: Хранитель дома</h1>
        <p className={styles.subtitle}>
          Помоги Василию заботиться о доме, принимать решения и сохранять баланс между жителями,
          состоянием дома и бюджетом.
        </p>

        {hasRecords ? (
          <div className={styles.records}>
            {progress.bestScore !== null ? <p>Лучший результат: {progress.bestScore}</p> : null}
            {bestRank ? <p>Лучший ранг: {bestRank.title}</p> : null}
            <p>Сыграно партий: {progress.completedDaysCount}</p>
            <p>
              Достижения: {unlockedCount} / {achievements.length}
            </p>
          </div>
        ) : (
          <p className={styles.empty}>Пока история дома только начинается. Василий уже ждёт.</p>
        )}

        <nav className={styles.menu} aria-label="Главное меню">
          {isPlaying ? (
            <Button variant="primary" onClick={() => setConfirmNewGame(true)}>
              <Play size={20} />
              Начать игру
            </Button>
          ) : (
            <Button variant="primary" to={ROUTES.intro}>
              <Play size={20} />
              Начать игру
            </Button>
          )}

          {canContinue ? (
            <Button variant="secondary" to={continueTo}>
              <RotateCcw size={20} />
              {isCompleted ? 'Итоги' : 'Продолжить'}
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              <RotateCcw size={20} />
              Продолжить
            </Button>
          )}

          <Button variant="secondary" to={ROUTES.achievements}>
            <Trophy size={20} />
            Достижения
          </Button>
          <Button variant="secondary" to={ROUTES.howToPlay}>
            <BookOpen size={20} />
            Как играть
          </Button>
          <Button variant="secondary" to={ROUTES.settings}>
            <Settings size={20} />
            Настройки
          </Button>
        </nav>
      </main>

      <footer className={styles.footer}>
        <p>ТСЖ «Васильевский»</p>
        <SiteBackLink />
      </footer>

      {confirmNewGame ? (
        <ConfirmModal
          title="Начать новую игру?"
          message="Текущая партия будет сброшена. Лучший результат, достижения и общая статистика сохранятся."
          confirmLabel="Начать заново"
          cancelLabel="Отмена"
          onCancel={() => setConfirmNewGame(false)}
          onConfirm={() => {
            setConfirmNewGame(false);
            navigate(ROUTES.intro);
          }}
        />
      ) : null}
    </div>
  );
}
