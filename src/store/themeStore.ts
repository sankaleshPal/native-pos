import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../theme/theme';

interface ThemeState {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      isDarkMode: false, // Default to light mode
      theme: lightTheme,

      toggleTheme: () =>
        set(state => {
          const newIsDarkMode = !state.isDarkMode;
          return {
            isDarkMode: newIsDarkMode,
            theme: newIsDarkMode ? darkTheme : lightTheme,
          };
        }),

      setTheme: (isDark: boolean) =>
        set(() => ({
          isDarkMode: isDark,
          theme: isDark ? darkTheme : lightTheme,
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ isDarkMode: state.isDarkMode }), // Only persist the boolean
      onRehydrateStorage: () => state => {
        // Hydrate the full theme object based on the persisted boolean
        if (state) {
          state.theme = state.isDarkMode ? darkTheme : lightTheme;
        }
      },
    },
  ),
);
