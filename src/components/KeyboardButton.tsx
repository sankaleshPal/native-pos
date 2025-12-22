import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  Platform,
  DimensionValue,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeStore } from '../store/themeStore';

interface KeyboardButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
  height?: number;
  testID?: string;
}

const KeyboardButton = ({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  width,
  height = 64, // Taller default for chunky look
  testID,
}: KeyboardButtonProps) => {
  const { theme } = useThemeStore();
  const styles = getStyles();

  // Animation value for translateY
  const depressionAnim = useRef(new Animated.Value(0)).current;

  // Press handlers
  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(depressionAnim, {
      toValue: 10, // Deep press to simulate compressing the thick border
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(depressionAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  // Determine colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          gradient: [theme.colors.surface, theme.colors.surface],
          text: theme.colors.textPrimary,
          side: theme.colors.border,
        };
      case 'danger':
        return {
          gradient: [theme.colors.error, theme.colors.error],
          text: '#FFFFFF',
          side: theme.colors.border,
        };
      case 'success':
        return {
          gradient: [theme.colors.success, theme.colors.success],
          text: '#FFFFFF',
          side: theme.colors.border,
        };
      case 'primary':
      default:
        // Use primary color for gradient. Side is secondary/darker.
        return {
          gradient: [theme.colors.primary, theme.colors.primary],
          text: theme.colors.textInverse,
          side: theme.colors.secondary,
        };
    }
  };

  const colors = getButtonColors();

  // Chunky Styles
  const buttonContainerStyle = {
    width: width,
    height: height,
    opacity: disabled ? 0.6 : 1,
  };

  const buttonFaceStyle = {
    borderColor: colors.side,
    // Provide a visible differentiation for the side if needed,
    // but the borderBottomWidth handles the geometry.
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.container, buttonContainerStyle, style]}
      testID={testID}
    >
      <Animated.View
        style={{
          transform: [{ translateY: depressionAnim }],
          width: '100%',
          height: '100%',
        }}
      >
        <LinearGradient
          colors={colors.gradient}
          style={[styles.buttonFace, buttonFaceStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <View style={styles.content}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              {label && (
                <Text style={[styles.label, { color: colors.text }]}>
                  {label}
                </Text>
              )}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      marginBottom: 12, // Margin to prevent layout jump if we were doing margin animation, but here strictly for spacing
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonFace: {
      width: '100%',
      height: '100%',
      borderRadius: 6,
      borderRightWidth: 1,
      borderLeftWidth: 1,
      borderBottomWidth: 10, // The chunky side
      justifyContent: 'center',
      alignItems: 'center',

      // Heavy Shadow / Elevation
      elevation: 30,
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowOffset: { width: 1, height: 13 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      // Adjust padding to center visually given the bottom border
      paddingBottom: 6,
    },
    iconContainer: {
      marginRight: 8,
    },
    label: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      letterSpacing: 0.5,
    },
  });

export default KeyboardButton;
