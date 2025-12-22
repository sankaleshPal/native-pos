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
import { Theme } from '../theme/types';

const ThemeSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, currentThemeId, setThemeId, availableThemes } =
    useThemeStore();
  const styles = getStyles(theme);

  const handleThemeSelect = (id: string) => {
    setThemeId(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
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
            color={theme.colors.textInverse}
          />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Theme Settings</Text>
          <Text style={styles.headerSubtitle}>Choose your preferred look</Text>
        </View>
      </View>

      {/* Theme Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Themes</Text>

          {availableThemes.map(item => {
            const isSelected = currentThemeId === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.themeCard,
                  isSelected && styles.themeCardSelected,
                ]}
                onPress={() => handleThemeSelect(item.id)}
              >
                <View style={styles.themeCardLeft}>
                  {/* Theme Preview Circle */}
                  <View
                    style={[
                      styles.previewCircle,
                      { backgroundColor: item.colors.background }, // Use the theme's background
                    ]}
                  >
                    <View
                      style={[
                        styles.previewDot,
                        { backgroundColor: item.colors.primary },
                      ]}
                    />
                  </View>

                  <View style={styles.themeInfo}>
                    <Text
                      style={[
                        styles.themeName,
                        {
                          color: isSelected
                            ? theme.colors.primary
                            : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.themeDescription}>
                      {item.isDark ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            Selected theme is saved and applied globally across the application.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) =>
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
      ...theme.shadows.level2,
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
      color: theme.colors.textInverse,
      fontFamily: 'Ubuntu-Bold',
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textInverse,
      marginTop: 2,
      opacity: 0.8,
      fontFamily: 'Ubuntu-Regular',
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
      color: theme.colors.textPrimary,
      marginBottom: 16,
      fontFamily: 'Ubuntu-Bold',
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
      borderColor: 'transparent',
      ...theme.shadows.level1,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.card,
    },
    themeCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    previewCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    previewDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
      fontFamily: 'Ubuntu-Bold',
    },
    themeDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    checkmark: {
      marginLeft: 12,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      alignItems: 'center',
      ...theme.shadows.level1,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      fontFamily: 'Ubuntu-Regular',
    },
  });

export default ThemeSettingsScreen;
