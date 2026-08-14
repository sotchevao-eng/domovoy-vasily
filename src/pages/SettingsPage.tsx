import { useState } from 'react';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { Layout } from '../components/Layout';
import { SiteBackLink } from '../components/SiteBackLink';
import { IS_VK_MODE, MAIN_SITE_URL, VK_APP_ID } from '../config/appConfig';
import { useGame } from '../hooks/useGame';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types/game';
import type { GameSettings } from '../types/game';
import styles from './page.module.css';

export function SettingsPage() {
  const { resetAllProgress } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [settings, setSettings] = useLocalStorage<GameSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS,
  );

  const toggle = (key: keyof GameSettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <Layout title="Настройки">
      <section className={styles.panel}>
        <h1>Настройки</h1>
        <p className={styles.lead}>Предпочтения сохраняются в браузере и не требуют сервера.</p>
        <div className={styles.stack}>
          <button type="button" className={styles.toggle} onClick={() => toggle('sound')}>
            <span>
              <b>Звуки</b>
              <span>Короткие подсказки. Пока аудиофайлы не добавлены, переключатель уже запоминается.</span>
            </span>
            <span className={`${styles.state} ${settings.sound ? '' : styles.stateOff}`}>
              {settings.sound ? 'Вкл' : 'Выкл'}
            </span>
          </button>
          <button type="button" className={styles.toggle} onClick={() => toggle('reduceMotion')}>
            <span>
              <b>Анимации</b>
              <span>Появление карточек, дома и уведомлений. Системная настройка «меньше движения» тоже учитывается.</span>
            </span>
            <span className={`${styles.state} ${settings.reduceMotion ? styles.stateOff : ''}`}>
              {settings.reduceMotion ? 'Выкл' : 'Вкл'}
            </span>
          </button>

          <div className={styles.dangerBlock}>
            <h2>Сброс данных</h2>
            <p className={styles.note}>
              Новая игра не трогает достижения и рекорды. Полный сброс удаляет всё.
            </p>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              Удалить весь игровой прогресс
            </Button>
          </div>

          {IS_VK_MODE && MAIN_SITE_URL ? (
            <div className={styles.dangerBlock}>
              <h2>О проекте</h2>
              <p className={styles.note}>Игра создана для ТСЖ «Васильевский».</p>
              <SiteBackLink anywhere />
            </div>
          ) : null}

          {IS_VK_MODE && !VK_APP_ID && import.meta.env.DEV ? (
            <p className={styles.note}>VK App ID не настроен</p>
          ) : null}
        </div>
      </section>

      {confirmReset ? (
        <ConfirmModal
          title="Удалить весь прогресс?"
          message="Будут удалены текущая игра, результаты, достижения и вся игровая статистика. Это действие нельзя отменить."
          confirmLabel="Удалить всё"
          cancelLabel="Отмена"
          variant="danger"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetAllProgress();
            setConfirmReset(false);
          }}
        />
      ) : null}
    </Layout>
  );
}
