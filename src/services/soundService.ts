import { STORAGE_KEYS } from '../types/game';
import { storage } from './storage';

export type SoundId =
  | 'button-click'
  | 'new-event'
  | 'good-choice'
  | 'neutral-choice'
  | 'bad-choice'
  | 'achievement'
  | 'day-complete';

const SOUND_FILES = import.meta.glob('../assets/sounds/*.{mp3,ogg,wav}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const SOUND_URLS: Partial<Record<SoundId, string>> = {};

for (const [path, url] of Object.entries(SOUND_FILES)) {
  const fileName = path.split('/').pop()?.replace(/\.(mp3|ogg|wav)$/i, '');
  if (fileName && isSoundId(fileName)) {
    SOUND_URLS[fileName] = url;
  }
}

export function playSound(id: SoundId) {
  if (!isSoundEnabled() || typeof Audio === 'undefined') {
    return;
  }

  const url = SOUND_URLS[id];

  if (!url) {
    return;
  }

  try {
    const audio = new Audio(url);
    audio.volume = 0.45;
    void audio.play().catch(() => {
      // Autoplay or missing user gesture should stay silent.
    });
  } catch {
    // No audio files yet, or playback is blocked.
  }
}

function isSoundEnabled(): boolean {
  try {
    const parsed = storage.get<{ sound?: boolean }>(STORAGE_KEYS.settings);

    if (!parsed) {
      return true;
    }

    return parsed.sound !== false;
  } catch {
    return true;
  }
}

function isSoundId(value: string): value is SoundId {
  return (
    value === 'button-click' ||
    value === 'new-event' ||
    value === 'good-choice' ||
    value === 'neutral-choice' ||
    value === 'bad-choice' ||
    value === 'achievement' ||
    value === 'day-complete'
  );
}
