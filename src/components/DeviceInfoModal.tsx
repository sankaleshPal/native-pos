import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useSettingsStore } from '../store/settingsStore';
import { deviceService } from '../services/DeviceService';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DeviceInfoItem {
  label: string;
  value: string;
}

interface DeviceInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const DeviceInfoModal: React.FC<DeviceInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const [deviceData, setDeviceData] = useState<DeviceInfoItem[]>([]);
  const { notificationsPaused, toggleNotifications } = useSettingsStore();

  useEffect(() => {
    if (visible) {
      loadDeviceInfo();
    }
  }, [visible]);

  const loadDeviceInfo = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    const model = DeviceInfo.getModel();
    const systemName = DeviceInfo.getSystemName();
    const systemVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    const isEmulator = await DeviceInfo.isEmulator();

    setDeviceData([
      { label: 'Device ID', value: uniqueId },
      { label: 'Model', value: model },
      { label: 'OS', value: `${systemName} ${systemVersion}` },
      { label: 'App Version', value: `${appVersion} (${buildNumber})` },
      { label: 'Type', value: isEmulator ? 'Emulator' : 'Physical Device' },
    ]);
  };

  const handleToggle = () => {
    const newState = !notificationsPaused;
    toggleNotifications();
    deviceService.updateSettings(!newState); // Pass ENABLED state (inverse of paused)
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Device Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Notification Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>Receive Order Alerts</Text>
                  <Text style={styles.rowSubtitle}>
                    {notificationsPaused ? 'Notifications Paused' : 'Active'}
                  </Text>
                </View>
                <Switch
                  value={!notificationsPaused}
                  onValueChange={handleToggle}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={'#f4f3f4'}
                />
              </View>
            </View>

            {/* Device Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Information</Text>
              <View style={styles.infoCard}>
                {deviceData.map((item, index) => (
                  <View
                    key={item.label}
                    style={[
                      styles.infoRow,
                      index === deviceData.length - 1 && styles.lastInfoRow,
                    ]}
                  >
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue} selectable>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.note}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.noteText}>
                Device ID is used to register this terminal with the backend
                server.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    width: '60%',
    textAlign: 'right',
  },
  note: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginLeft: 6,
  },
});

export default DeviceInfoModal;
