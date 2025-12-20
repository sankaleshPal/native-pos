import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ThemeSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, isDarkMode, setTheme } = useThemeStore();
  const styles = getStyles(theme);

  const themeOptions = [
    {
      id: 'light',
      name: 'Light Mode',
      description: 'Clean and bright interface',
      icon: 'sunny',
      value: false,
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      description: 'Easy on the eyes',
      icon: 'moon',
      value: true,
    },
  ];

  const handleThemeSelect = (darkMode: boolean) => {
    setTheme(darkMode);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.primaryForeground}
          />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Theme Settings</Text>
          <Text style={styles.headerSubtitle}>Choose your preferred theme</Text>
        </View>
      </View>

      {/* Theme Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          {themeOptions.map(option => {
            const isSelected = isDarkMode === option.value;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeCard,
                  isSelected && styles.themeCardSelected,
                ]}
                onPress={() => handleThemeSelect(option.value)}
              >
                <View style={styles.themeCardLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      isSelected && styles.iconBoxSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={
                        isSelected
                          ? theme.colors.primaryForeground
                          : theme.colors.primary
                      }
                    />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>{option.name}</Text>
                    <Text style={styles.themeDescription}>
                      {option.description}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons
                      name="checkmark-circle"
                      size={28}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewDot} />
              <View style={styles.previewDot} />
              <View style={styles.previewDot} />
            </View>
            <View style={styles.previewContent}>
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
              <View style={[styles.previewLine, { width: '60%' }]} />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            Theme preference is saved automatically and will persist across app
            restarts.
          </Text>
        </View>
      </ScrollView>
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
      paddingTop: 48,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.card,
    },
    backButton: {
      marginRight: 16,
      padding: 4,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primaryForeground,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 2,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    themeCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      ...theme.shadows.card,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceHighlight,
    },
    themeCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    iconBoxSelected: {
      backgroundColor: theme.colors.primary,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    checkmark: {
      marginLeft: 12,
    },
    previewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.card,
    },
    previewHeader: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    previewDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    previewContent: {
      gap: 12,
    },
    previewLine: {
      height: 12,
      backgroundColor: theme.colors.surfaceHighlight,
      borderRadius: 6,
      width: '100%',
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceHighlight,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

export default ThemeSettingsScreen;
