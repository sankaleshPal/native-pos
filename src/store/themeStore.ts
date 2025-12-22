import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme/themes';
import { Theme } from '../theme/types';

interface ThemeState {
  currentThemeId: string;
  theme: Theme;
  setThemeId: (id: string) => void;
  availableThemes: Theme[];
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      currentThemeId: 'carbon_gold', // Default to Carbon Gold
      theme: themes['carbon_gold'],
      availableThemes: Object.values(themes),

      setThemeId: (id: string) => {
        const newTheme = themes[id];
        if (newTheme) {
          set({ currentThemeId: id, theme: newTheme });
        } else {
          console.warn(`Theme with id '${id}' not found.`);
        }
      },
    }),
    {
      name: 'theme-storage-v2', // Changed name to avoid conflict with old schema
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ currentThemeId: state.currentThemeId }), // Only persist the ID
      onRehydrateStorage: () => state => {
        if (state && state.currentThemeId) {
          const persistedTheme = themes[state.currentThemeId];
          if (persistedTheme) {
            state.theme = persistedTheme;
          } else {
            // Fallback if persisted ID is invalid
            state.theme = themes['carbon_gold'];
            state.currentThemeId = 'carbon_gold';
          }
        }
      },
    },
  ),
);
