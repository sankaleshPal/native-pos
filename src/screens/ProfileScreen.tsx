import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';

const ProfileScreen = () => {
  const { mobileNumber, loginTime } = useAuthStore();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="phone-portrait" size={24} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{mobileNumber || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="time" size={24} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Last Login</Text>
              <Text style={styles.infoValue}>{formatDate(loginTime)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
});

export default ProfileScreen;
