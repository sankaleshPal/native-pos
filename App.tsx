import React, { JSX, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryProvider } from './src/providers/QueryProvider';
import { getDatabase } from './src/db/database';
import { seedLargeMenuData } from './src/db/seedLargeMenu';

import { Alert, StatusBar } from 'react-native';
import { useThemeStore } from './src/store/themeStore';

import { notificationService } from './src/services/NotificationService';
import GlobalOrderAlert from './src/components/GlobalOrderAlert';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
export default function App(): JSX.Element {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize database and seed data
    const initDB = async () => {
      getDatabase();
      await seedLargeMenuData();
    };
    initDB();

    // Initialize Notifications
    notificationService.initialize();
    reqPermissionAndroid();
  }, []);

  const reqPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'Allow notifications to stay updated',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission granted');
        console.log('Permission granted');
      } else {
        Alert.alert('Permission denied');
        console.log('Permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
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
