import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import WifiManager from 'react-native-wifi-reborn';

type AuthStackParamList = {
  WiFiNetwork: undefined;
  Login: undefined;
};

type WiFiNetworkScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'WiFiNetwork'
>;

interface WiFiNetwork {
  id: string;
  name: string;
  isConnected: boolean;
  signalStrength: 'excellent' | 'good' | 'fair' | 'weak';
}

export default function WiFiNetworkScreen() {
  const navigation = useNavigation<WiFiNetworkScreenNavigationProp>();
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);

  useEffect(() => {
    loadNetworkInfo();
  }, []);

  const loadNetworkInfo = async () => {
    try {
      // Request location permission (required for WiFi scanning)
      if (Platform.OS === 'android') {
        // Android requires runtime permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location permission to scan WiFi networks.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          setLoading(false);
          return;
        }
      }
      // iOS permissions are handled via Info.plist (NSLocalNetworkUsageDescription)
      // No runtime permission request needed for iOS

      // Get current connected WiFi SSID
      let connectedSSID: string | null = null;
      try {
        connectedSSID = await WifiManager.getCurrentWifiSSID();
        // Remove quotes if present
        if (connectedSSID) {
          connectedSSID = connectedSSID.replace(/"/g, '');
        }
      } catch (error) {
        console.log('Error getting current SSID:', error);
      }

      setCurrentNetwork(connectedSSID);

      // Scan for nearby WiFi networks
      let wifiList: any[] = [];
      try {
        wifiList = await WifiManager.loadWifiList();
      } catch (error) {
        console.log('Error loading WiFi list:', error);
      }

      // Convert to our WiFiNetwork format
      const networks: WiFiNetwork[] = wifiList.map((wifi, index) => {
        // Determine signal strength based on RSSI (signal level)
        let signalStrength: 'excellent' | 'good' | 'fair' | 'weak' = 'weak';
        if (wifi.level > -50) {
          signalStrength = 'excellent';
        } else if (wifi.level > -60) {
          signalStrength = 'good';
        } else if (wifi.level > -70) {
          signalStrength = 'fair';
        }

        return {
          id: `${wifi.BSSID || index}`,
          name: wifi.SSID,
          isConnected: wifi.SSID === connectedSSID,
          signalStrength,
        };
      });

      // Sort networks: connected first, then by signal strength
      networks.sort((a, b) => {
        if (a.isConnected) return -1;
        if (b.isConnected) return 1;
        
        const strengthOrder = { excellent: 4, good: 3, fair: 2, weak: 1 };
        return strengthOrder[b.signalStrength] - strengthOrder[a.signalStrength];
      });

      setNetworks(networks);
    } catch (error) {
      console.error('Error loading network info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSignalIcon = (strength: string) => {
    switch (strength) {
      case 'excellent':
        return 'wifi';
      case 'good':
        return 'wifi';
      case 'fair':
        return 'wifi';
      case 'weak':
        return 'wifi-outline';
      default:
        return 'wifi-outline';
    }
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'fair':
        return '#FFC107';
      case 'weak':
        return '#FF5722';
      default:
        return '#9E9E9E';
    }
  };

  const renderNetworkItem = ({ item }: { item: WiFiNetwork }) => (
    <View
      style={[
        styles.networkItem,
        item.isConnected && styles.connectedNetwork,
      ]}
    >
      <Ionicons
        name={getSignalIcon(item.signalStrength)}
        size={24}
        color={getSignalColor(item.signalStrength)}
      />
      <View style={styles.networkInfo}>
        <Text style={styles.networkName}>{item.name}</Text>
        {item.isConnected && (
          <Text style={styles.connectedText}>Connected</Text>
        )}
      </View>
      {item.isConnected && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Scanning networks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={48} color="#2196F3" />
        <Text style={styles.title}>Available Networks</Text>
        <Text style={styles.subtitle}>
          {currentNetwork ? `Connected to: ${currentNetwork}` : 'Not connected'}
        </Text>
      </View>

      <FlatList
        data={networks}
        renderItem={renderNetworkItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.continueButtonText}>Continue to Login</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectedNetwork: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  networkInfo: {
    flex: 1,
    marginLeft: 16,
  },
  networkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  connectedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
