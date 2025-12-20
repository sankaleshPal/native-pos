import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { create } from 'zustand';
import { formatElapsedTime } from '../utils/timeUtils';

interface TimerState {
  elapsedTime: string;
  intervalId: NodeJS.Timeout | null;
  startTimer: (startTime: string) => void;
  stopTimer: () => void;
}

const useTimerStore = create<TimerState>()((set, get) => ({
  elapsedTime: '0s',
  intervalId: null,

  startTimer: (startTime: string) => {
    // Clear existing interval
    const existingInterval = get().intervalId;
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Update immediately
    set({ elapsedTime: formatElapsedTime(startTime) });

    // Set up interval to update every minute
    const interval = setInterval(() => {
      set({ elapsedTime: formatElapsedTime(startTime) });
    }, 60000); // Update every minute

    set({ intervalId: interval });
  },

  stopTimer: () => {
    const interval = get().intervalId;
    if (interval) {
      clearInterval(interval);
      set({ intervalId: null, elapsedTime: '0s' });
    }
  },
}));

interface TableTimerProps {
  activeSince: string;
  style?: any;
}

const TableTimer: React.FC<TableTimerProps> = ({ activeSince, style }) => {
  const { elapsedTime, startTimer, stopTimer } = useTimerStore();

  useEffect(() => {
    if (activeSince) {
      startTimer(activeSince);
    }

    return () => {
      stopTimer();
    };
  }, [activeSince]);

  return <Text style={[styles.timer, style]}>{elapsedTime}</Text>;
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default TableTimer;
