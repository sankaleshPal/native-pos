import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useNotificationStore } from '../store/notificationStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const GlobalOrderAlert = () => {
  const { activeAlert, hideActiveAlert } = useNotificationStore();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (activeAlert) {
      // Slide In
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [activeAlert]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      hideActiveAlert();
    });
  };

  const handlePress = () => {
    handleDismiss();
    // Navigate to Orders/Tables screen
    // TODO: Adjust route name based on your navigation structure
    // navigation.navigate('Tables');
  };

  if (!activeAlert) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + (Platform.OS === 'android' ? 10 : 0),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#FFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {activeAlert.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {activeAlert.body}
          </Text>
          {activeAlert.tableName && (
            <Text style={styles.meta}>{activeAlert.tableName} • Just now</Text>
          )}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <Ionicons name="close" size={20} color="#9E9E9E" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999, // Ensure it's on top
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800', // Warning/Alert color
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    color: '#616161',
  },
  meta: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
  },
});

export default GlobalOrderAlert;
