import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const ProfileScreen = () => {
  const { mobileNumber, loginTime } = useAuthStore();
  const { isDarkMode, toggleTheme, theme } = useThemeStore();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person"
            size={64}
            color={theme.colors.primaryForeground}
          />
        </View>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name="phone-portrait"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{mobileNumber || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Last Login</Text>
              <Text style={styles.infoValue}>{formatDate(loginTime)}</Text>
            </View>
          </View>
        </View>

        {/* Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isDarkMode ? '#475569' : '#E0E7FF' },
                ]}
              >
                <Ionicons
                  name={isDarkMode ? 'moon' : 'sunny'}
                  size={20}
                  color={isDarkMode ? '#F8FAFC' : '#6366F1'}
                />
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      padding: 32,
      alignItems: 'center',
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primaryForeground,
    },
    content: {
      flex: 1,
      padding: 24,
      marginTop: -20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      ...theme.shadows.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    infoText: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 12,
      marginLeft: 56, // Align with text
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingLabel: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
      marginLeft: 4,
    },
  });

export default ProfileScreen;
