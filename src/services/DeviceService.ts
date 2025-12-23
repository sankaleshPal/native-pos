import DeviceInfo from 'react-native-device-info';
import { useSettingsStore } from '../store/settingsStore';
import { Platform } from 'react-native';

// TODO: Replace with your actual backend URL from config
const BACKEND_URL = 'https://api.yourapp.com';

interface DeviceRegistrationPayload {
  businessId: string; // Retrieve from AuthStore/User context
  token: string;
  platform: 'android' | 'ios';
  deviceId: string;
  deviceModel: string;
  deviceName: string; // Add this
  osVersion: string;
  appVersion: string;
  notificationEnabled: boolean;
}

class DeviceService {
  async registerDevice(token: string) {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceModel = DeviceInfo.getModel();
      const deviceName = await DeviceInfo.getDeviceName(); // Add this
      const osVersion = DeviceInfo.getSystemVersion();
      const appVersion = DeviceInfo.getVersion();
      const notificationEnabled =
        !useSettingsStore.getState().notificationsPaused;

      const payload: DeviceRegistrationPayload = {
        businessId: 'CURRENT_BUSINESS_ID', // Replace with real ID
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        deviceId,
        deviceModel,
        deviceName,
        osVersion,
        appVersion,
        notificationEnabled,
      };

      console.log('Registering device with payload:', payload);

      // API Call Placeholder
      // await fetch(`${BACKEND_URL}/device/register`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(payload),
      // });
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  async updateSettings(enabled: boolean) {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log(
        `Updating device ${deviceId} notification setting to:`,
        enabled,
      );

      // API Call Placeholder
      // await fetch(`${BACKEND_URL}/device/${deviceId}/notification-enabled`, {
      //     method: 'PATCH',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ notificationEnabled: enabled }),
      // });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }
}

export const deviceService = new DeviceService();
