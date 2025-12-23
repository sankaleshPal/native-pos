import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notificationsPaused: boolean;
  toggleNotifications: () => void;
  setNotificationsPaused: (paused: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      notificationsPaused: false,
      toggleNotifications: () =>
        set(state => ({ notificationsPaused: !state.notificationsPaused })),
      setNotificationsPaused: (paused: boolean) =>
        set({ notificationsPaused: paused }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
