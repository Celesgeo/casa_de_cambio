import { create } from 'zustand';
import { safeStorage } from '../lib/storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const stored = safeStorage.getItem('ga-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  try {
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getInitialMode(),
  toggleMode: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    safeStorage.setItem('ga-theme', next);
    set({ mode: next });
  }
}));

