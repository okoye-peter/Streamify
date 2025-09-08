import { create } from 'zustand'
import type { ThemeState } from '../types';

export const useThemeStore = create<ThemeState>((set) => ({
    theme: localStorage.getItem('theme') || 'forest',
    setTheme: (newTheme: string) => {
        localStorage.setItem('theme', newTheme);
        set({ theme: newTheme })
    },
}))