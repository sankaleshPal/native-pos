import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useSettingsStore } from '../store/settingsStore';
import { Platform } from 'react-native';

class NotificationService {
  async initialize() {
    await this.requestUserPermission();
    await this.createChannel();
    this.setupForegroundListener();
    await this.getFCMToken();
  }

  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // You would normally send this token to your backend
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }

  async createChannel() {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  setupForegroundListener() {
    return messaging().onMessage(async remoteMessage => {
      const isPaused = useSettingsStore.getState().notificationsPaused;
      if (isPaused) {
        console.log('Notification skipped (paused)');
        return;
      }

      console.log('A new FCM message arrived!', remoteMessage);

      // Display a notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Order',
        body: remoteMessage.notification?.body || 'You have a new order!',
        android: {
          channelId: 'default',
          pressAction: {
            id: 'default',
          },
        },
      });
    });
  }

  // This can be used for local simulations (Dummy Orders)
  async displayLocalNotification(title: string, body: string) {
    const isPaused = useSettingsStore.getState().notificationsPaused;
    if (isPaused) {
      console.log('Local notification skipped (paused)');
      return;
    }

    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
        // Open app on press
      },
    });
  }
}

export const notificationService = new NotificationService();

// Background handler must be outside the class or static
export const backgroundMessageHandler = async (remoteMessage: any) => {
  // We can also check store here, but store might not be ready in headless task.
  // Usually better to let background notification happen or check persistent storage manually.
  // For now, we trust the system handling or native filtering if needed.
  console.log('Message handled in the background!', remoteMessage);
};
