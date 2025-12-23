import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

import DeviceInfoModal from './DeviceInfoModal';

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  const logout = useAuthStore(state => state.logout);
  const { notificationsPaused, toggleNotifications } = useSettingsStore();

  const [deviceModalVisible, setDeviceModalVisible] = React.useState(false);

  // @ts-ignore - navigation is available in props
  const navigation = props.navigation;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          // 1. Clear State
          logout();

          // 2. Reset Navigation to Login
          // We need to go back to the root navigator's stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'POSLogin' }],
          });
        },
      },
    ]);
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.scrollContent}
        >
          <DrawerItemList {...props} />

          {/* Device Settings Item */}
          <TouchableOpacity
            style={styles.deviceSettingsItem}
            onPress={() => setDeviceModalVisible(true)}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color="#666"
              style={{ marginRight: 32 }}
            />
            <Text style={styles.deviceSettingsText}>Device Settings</Text>
          </TouchableOpacity>
        </DrawerContentScrollView>

        <View style={styles.preferencesContainer}>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>Pause Notifications</Text>
            <Switch
              value={notificationsPaused}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificationsPaused ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <DeviceInfoModal
        visible={deviceModalVisible}
        onClose={() => setDeviceModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  preferencesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  deviceSettingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  deviceSettingsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
});
