import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkStatus = 'good' | 'slow' | 'offline';

// WiFi Signal Icon Component
const WiFiIcon = ({ status }: { status: NetworkStatus }) => {
  const getBarColor = () => {
    switch (status) {
      case 'good':
        return '#4CAF50'; // Green
      case 'slow':
        return '#FFC107'; // Yellow
      case 'offline':
        return '#9E9E9E'; // Gray
      default:
        return '#4CAF50';
    }
  };

  const color = getBarColor();
  const showBars = status === 'good' ? 3 : status === 'slow' ? 2 : 0;

  return (
    <View style={styles.wifiContainer}>
      {/* Bar 1 - Shortest */}
      <View
        style={[
          styles.wifiBar,
          styles.bar1,
          { backgroundColor: showBars >= 1 ? color : '#E0E0E0' },
        ]}
      />
      {/* Bar 2 - Medium */}
      <View
        style={[
          styles.wifiBar,
          styles.bar2,
          { backgroundColor: showBars >= 2 ? color : '#E0E0E0' },
        ]}
      />
      {/* Bar 3 - Tallest */}
      <View
        style={[
          styles.wifiBar,
          styles.bar3,
          { backgroundColor: showBars >= 3 ? color : '#E0E0E0' },
        ]}
      />
    </View>
  );
};

export default function NetworkSmiley() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('good');

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      updateNetworkStatus(state);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      updateNetworkStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateNetworkStatus = (state: NetInfoState) => {
    if (!state.isConnected) {
      setNetworkStatus('offline');
    } else if (state.isInternetReachable === false) {
      setNetworkStatus('offline');
    } else {
      // Check connection type and details for speed
      const type = state.type;
      const details = state.details;
      
      // Consider 2G or expensive connections as slow
      if (type === 'cellular' && details && 'cellularGeneration' in details) {
        const generation = details.cellularGeneration;
        if (generation === '2g') {
          setNetworkStatus('slow');
        } else {
          setNetworkStatus('good');
        }
      } else if (details && 'isConnectionExpensive' in details && details.isConnectionExpensive) {
        setNetworkStatus('slow');
      } else {
        setNetworkStatus('good');
      }
    }
  };

  const handleStartOffline = () => {
    Alert.alert(
      'Offline Mode',
      'Starting offline mode. You can continue using the app with cached data.',
      [{ text: 'OK' }]
    );
  };

  const getSmiley = () => {
    switch (networkStatus) {
      case 'good':
        return '😊';
      case 'slow':
        return '😕';
      case 'offline':
        return '😢';
      default:
        return '😊';
    }
  };

  return (
    <View style={styles.container}>
      <WiFiIcon status={networkStatus} />
      <Text style={styles.smiley}>{getSmiley()}</Text>
      {networkStatus === 'offline' && (
        <TouchableOpacity 
          style={styles.offlineButton}
          onPress={handleStartOffline}
        >
          <Text style={styles.buttonText}>Start Offline</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  wifiContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 8,
    height: 20,
  },
  wifiBar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  bar1: {
    height: 6,
  },
  bar2: {
    height: 12,
  },
  bar3: {
    height: 18,
  },
  smiley: {
    fontSize: 24,
    marginRight: 8,
  },
  offlineButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
