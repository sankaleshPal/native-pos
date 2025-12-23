import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryProvider } from './src/providers/QueryProvider';
import { getDatabase } from './src/db/database';
import { seedLargeMenuData } from './src/db/seedLargeMenu';

import { StatusBar } from 'react-native';
import { useThemeStore } from './src/store/themeStore';

import { notificationService } from './src/services/NotificationService';
import GlobalOrderAlert from './src/components/GlobalOrderAlert';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App(): React.JSX.Element {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    // Initialize database and seed data
    const initDB = async () => {
      getDatabase();
      await seedLargeMenuData();
    };
    initDB();

    // Initialize Notifications
    notificationService.initialize();
  }, []);

  return (
    <QueryProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
          <NavigationContainer>
            <StatusBar
              barStyle={theme.isDark ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.background}
              translucent={false}
            />
            <GlobalOrderAlert />
            <RootNavigator />
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryProvider>
  );
}
