import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useSettingsStore } from '../store/settingsStore';
import { deviceService } from './DeviceService';
import { useNotificationStore } from '../store/notificationStore';
import { Platform } from 'react-native';

class NotificationService {
  async initialize() {
    await this.requestUserPermission();
    await this.createChannel();
    this.setupForegroundListener();
    this.setupTokenRefreshListener();
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
        await deviceService.registerDevice(fcmToken);
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }

  setupTokenRefreshListener() {
    return messaging().onTokenRefresh(async token => {
      console.log('FCM Token Refreshed:', token);
      await deviceService.registerDevice(token);
    });
  }

  async createChannel() {
    await notifee.createChannel({
      id: 'orders_channel',
      name: 'Orders Channel',
      importance: AndroidImportance.HIGH,
      sound: 'order', // Matches android/app/src/main/res/raw/order.mp3
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

      // Update Global Store
      const { showOrderAlert } = useNotificationStore.getState();
      showOrderAlert({
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || 'New Order',
        body: remoteMessage.notification?.body || 'You have a new order!',
        receivedAt: Date.now(),
        tableName: remoteMessage.data?.tableName as string,
        orderId: remoteMessage.data?.orderId as string,
      });

      // Display a notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Order',
        body: remoteMessage.notification?.body || 'You have a new order!',
        android: {
          channelId: 'orders_channel', // Updated channel
          importance: AndroidImportance.HIGH,
          sound: 'order', // Custom sound
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

    // Update Global Store for local simulation too
    const { showOrderAlert } = useNotificationStore.getState();
    showOrderAlert({
      id: Date.now().toString(),
      title: title,
      body: body,
      receivedAt: Date.now(),
      // Mock data for local simulation
      tableName: 'Table 5',
      orderId: 'ORD-TEST',
    });

    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId: 'orders_channel',
        importance: AndroidImportance.HIGH,
        sound: 'order',
        pressAction: {
          id: 'default',
        },
        // Open app on press
      },
    });
  }
  async sendTestNotification(title: string, body: string) {
    // Simulate Backend API Call
    console.log(`[MOCK API] Sending notification: ${title} - ${body}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, we can trigger a local notification to simulate receipt
    await this.displayLocalNotification(title, body);
  }
}

export const notificationService = new NotificationService();

// Background handler must be outside the class or static
export const backgroundMessageHandler = async (remoteMessage: any) => {
  console.log('Message handled in the background!', remoteMessage);
};
