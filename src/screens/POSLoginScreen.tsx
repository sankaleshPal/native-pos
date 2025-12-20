import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePOSStore } from '../store/posStore';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface POSLoginScreenProps {
  onLoginSuccess: () => void;
}

const POSLoginScreen: React.FC<POSLoginScreenProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = usePOSStore(state => state.login);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone and password');
      return;
    }

    setLoading(true);
    const success = await login(phone, password);
    setLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      Alert.alert('Login Failed', 'Invalid phone number or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="restaurant" size={80} color="#2196F3" />
        </View>

        <Text style={styles.title}>POS System</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="call"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Default Users:</Text>
          <Text style={styles.footerHint}>Sankalesh: 8668229890 / 6344</Text>
          <Text style={styles.footerHint}>Datta: 9588413799 / 6344</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#212121',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  footerHint: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 4,
  },
});

export default POSLoginScreen;
