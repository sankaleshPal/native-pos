import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { usePOSStore } from '../store/posStore';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const currentUser = usePOSStore(state => state.currentUser);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to tables after 2.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onComplete]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>

        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.userName}>{currentUser?.name}</Text>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>Loading your workspace...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 40,
  },
  messageContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  message: {
    fontSize: 16,
    color: '#1976D2',
  },
});

export default WelcomeScreen;
