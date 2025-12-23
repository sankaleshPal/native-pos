import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import KeyboardButton from '../components/KeyboardButton';
import { useThemeStore } from '../store/themeStore';
import { biometricService } from '../services/BiometricService';

export default function LoginScreen() {
  const { theme } = useThemeStore();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometryAvailable, setBiometryAvailable] = useState(false);

  React.useEffect(() => {
    biometricService.isSensorAvailable().then(setBiometryAvailable);
  }, []);

  const handleBiometricLogin = async () => {
    const success = await biometricService.simplePrompt(
      'Login with Biometrics',
    );
    if (success) {
      setLoading(true);
      // Use hardcoded demo credentials for biometric login
      const loginSuccess = await login('8668229890', '2701');
      setLoading(false);
      if (!loginSuccess) {
        Alert.alert(
          'Error',
          'Default credentials failed. Please login manually.',
        );
      }
    }
  };

  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    // Reset error
    setError('');

    // Validation
    if (!mobileNumber || !password) {
      setError('Please enter both mobile number and password');
      return;
    }

    if (mobileNumber.length !== 10) {
      setError('Mobile number must be 10 digits');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(async () => {
      const success = await login(mobileNumber, password);

      setLoading(false);

      if (!success) {
        setError('Invalid mobile number or password');
        Alert.alert(
          'Login Failed',
          'Invalid credentials. Please try again.\n\nHint: Mobile: 8668229890, Password: 2701',
        );
      }
      // If success, the auth state will update and navigation will happen automatically
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 100, height: 100, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Mobile Number Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="phone-portrait" size={20} color="#757575" />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#9E9E9E"
              value={mobileNumber}
              onChangeText={text => {
                setMobileNumber(text);
                setError('');
              }}
              keyboardType="phone-pad"
              maxLength={10}
              autoComplete="tel"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#757575" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9E9E9E"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#757575"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <KeyboardButton
            label="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            variant="primary"
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.textInverse}
              />
            }
            style={styles.loginButtonContainer}
          />

          {/* Biometric Login */}
          {biometryAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Ionicons
                name="finger-print"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={styles.biometricText}>Login with Fingerprint</Text>
            </TouchableOpacity>
          )}

          {/* Hint */}
          <View style={styles.hintContainer}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#757575"
            />
            <Text style={styles.hintText}>
              Demo credentials: 8668229890 / 2701
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

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
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 12,
    padding: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },

  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  hintText: {
    color: '#1976D2',
    fontSize: 12,
    marginLeft: 8,
  },
  loginButtonContainer: {
    marginTop: 8,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
  },
  biometricText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
});
