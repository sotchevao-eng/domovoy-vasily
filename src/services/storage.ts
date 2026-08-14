export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored == null) {
        return null;
      }

      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable in private mode or a restricted WebView.
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore quota / access errors.
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
