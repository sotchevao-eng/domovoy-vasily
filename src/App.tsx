import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DocumentMeta } from './components/DocumentMeta';
import { GameProvider } from './hooks/useGame';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AchievementsPage } from './pages/AchievementsPage';
import { DayResultPage } from './pages/DayResultPage';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { IntroPage } from './pages/IntroPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { APP_MODE, ROUTES } from './config/appConfig';
import { VKBackHandler } from './integrations/vk/VKBackHandler';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from './types/game';
import type { GameSettings } from './types/game';

export default function App() {
  return (
    <GameProvider>
      <DocumentMeta />
      <MotionPreference />
      <VKBackHandler />
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.intro} element={<IntroPage />} />
        <Route path={ROUTES.play} element={<GamePage />} />
        <Route path="/game" element={<Navigate to={ROUTES.play} replace />} />
        <Route path={ROUTES.result} element={<DayResultPage />} />
        <Route path={ROUTES.achievements} element={<AchievementsPage />} />
        <Route path={ROUTES.howToPlay} element={<HowToPlayPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </GameProvider>
  );
}

function MotionPreference() {
  const [settings] = useLocalStorage<GameSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? 'true' : 'false';
    document.documentElement.dataset.appMode = APP_MODE;
  }, [settings.reduceMotion]);

  return null;
}
