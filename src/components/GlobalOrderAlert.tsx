import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useOrderStore } from '../store/orderStore';
import Sound from 'react-native-sound';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

// Enable playback in silence mode
Sound.setCategory('Playback');

const GlobalOrderAlert = () => {
  const { activeAlert, dismissAlert } = useOrderStore();
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start off-screen top
  const soundRef = useRef<Sound | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to stop sound
  const stopSound = () => {
    if (soundRef.current) {
      soundRef.current.stop(() => {
        soundRef.current?.release();
      });
      soundRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (activeAlert) {
      // Stop any previous sound just in case
      stopSound();

      // Play Sound
      // On Android res/raw, must not include extension
      const soundName = Platform.OS === 'android' ? 'bell' : 'bell.mp3';

      const bell = new Sound(soundName, Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }

        // Loop the sound
        bell.setNumberOfLoops(-1);

        bell.play(success => {
          if (!success) {
            console.log('playback failed due to audio decoding errors');
          }
        });

        soundRef.current = bell;
      });

      // Stop after 10 seconds automatically
      timeoutRef.current = setTimeout(() => {
        stopSound();
      }, 10000);

      // Animate In
      Animated.spring(slideAnim, {
        toValue: Platform.OS === 'ios' ? 50 : 20, // Adjust for safe area/status bar
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      // Stop sound immediately if alert is dismissed
      stopSound();

      // Animate Out
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    // Cleanup on unmount
    return () => {
      stopSound();
    };
  }, [activeAlert, slideAnim]);

  if (!activeAlert) return null;

  const handlePress = () => {
    stopSound(); // Stop sound on interaction
    dismissAlert();
    navigation.navigate('Orders');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.accent,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.left}>
          <Text style={styles.icon}>🔔</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            New Order Received!
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Table {activeAlert.tableNumber} • {activeAlert.userName}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.action, { color: theme.colors.primary }]}>
            VIEW
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999, // Ensure it's on top
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  left: {
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  center: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  right: {
    marginLeft: 16,
  },
  action: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GlobalOrderAlert;
