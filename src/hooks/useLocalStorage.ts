import { useCallback, useState } from 'react';
import { storage } from '../services/storage';
import { LEGACY_SETTINGS_STORAGE_KEY, STORAGE_KEYS } from '../types/game';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue, isValid));

  const setStoredValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      if (typeof next !== 'function') {
        persistValue(key, next);
        setValue(next);
        return;
      }

      setValue((previous) => {
        const resolved = (next as (previous: T) => T)(previous);
        persistValue(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, setStoredValue] as const;
}

function readStoredValue<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
): T {
  try {
    migrateLegacySettings(key);
    const parsed = storage.get<T>(key);

    if (parsed == null) {
      return initialValue;
    }

    if (isValid && !isValid(parsed)) {
      return initialValue;
    }

    return parsed;
  } catch {
    return initialValue;
  }
}

function migrateLegacySettings(key: string) {
  if (key !== STORAGE_KEYS.settings || storage.get(key) != null) {
    return;
  }

  const legacy = storage.get(LEGACY_SETTINGS_STORAGE_KEY);

  if (legacy != null) {
    storage.set(key, legacy);
  }
}

function persistValue<T>(key: string, value: T) {
  storage.set(key, value);
}
