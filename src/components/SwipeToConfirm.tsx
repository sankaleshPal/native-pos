import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { create } from 'zustand';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.6;

interface SwipeState {
  translateX: Animated.Value;
  swiping: boolean;
  setSwiping: (swiping: boolean) => void;
  reset: () => void;
}

const useSwipeStore = create<SwipeState>()((set, get) => ({
  translateX: new Animated.Value(0),
  swiping: false,
  setSwiping: swiping => set({ swiping }),
  reset: () => {
    Animated.spring(get().translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    set({ swiping: false });
  },
}));

interface SwipeToConfirmProps {
  onConfirm: () => void;
  text?: string;
  disabled?: boolean;
}

const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  text = 'Swipe to Punch KOT',
  disabled = false,
}) => {
  const { translateX, swiping, setSwiping, reset } = useSwipeStore();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,

    onPanResponderGrant: () => {
      setSwiping(true);
    },

    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0 && gestureState.dx < SWIPE_THRESHOLD) {
        translateX.setValue(gestureState.dx);
      }
    },

    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        // Success - complete the swipe
        Animated.spring(translateX, {
          toValue: SWIPE_THRESHOLD,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start(() => {
          onConfirm();
          // Reset after a short delay
          setTimeout(() => {
            reset();
          }, 300);
        });
      } else {
        // Failed - reset
        reset();
      }
    },
  });

  const sliderOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const checkmarkOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.8, SWIPE_THRESHOLD],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <LinearGradient
        colors={disabled ? ['#9CA3AF', '#6B7280'] : ['#7C3AED', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.track}
      >
        <Animated.Text style={[styles.text, { opacity: sliderOpacity }]}>
          {text}
        </Animated.Text>

        <Animated.View style={{ opacity: checkmarkOpacity }}>
          <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
        </Animated.View>
      </LinearGradient>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.slider,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F3F4F6']}
          style={styles.sliderGradient}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={disabled ? '#9CA3AF' : '#7C3AED'}
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  slider: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: 56,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sliderGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeToConfirm;
