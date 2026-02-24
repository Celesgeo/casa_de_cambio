/**
 * Safe storage for web (localStorage) and environments where it may be unavailable (SSR, mobile, embedded web, etc.)
 * Falls back to an in-memory store when localStorage is unavailable or throws (e.g. quota, private mode, iframe restrictions).
 */
const memoryStore = new Map<string, string>();

const hasStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (!hasStorage()) return memoryStore.get(key) ?? null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },
  setItem: (key: string, value: string): void => {
    memoryStore.set(key, value);
    if (!hasStorage()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // quota, security or embedded env; session stays in memory
    }
  },
  removeItem: (key: string): void => {
    memoryStore.delete(key);
    if (!hasStorage()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};
