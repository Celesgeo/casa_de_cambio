/**
 * Safe storage for web (localStorage) and environments where it may be unavailable (SSR, mobile, etc.)
 */
const hasStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (!hasStorage()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!hasStorage()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore quota or security errors
    }
  },
  removeItem: (key: string): void => {
    if (!hasStorage()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};
