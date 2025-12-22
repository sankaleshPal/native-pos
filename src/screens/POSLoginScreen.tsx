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
  StatusBar,
} from 'react-native';
import { usePOSStore } from '../store/posStore';
import { useThemeStore } from '../store/themeStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import KeyboardButton from '../components/KeyboardButton';

interface POSLoginScreenProps {
  onLoginSuccess: () => void;
}

const POSLoginScreen: React.FC<POSLoginScreenProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = usePOSStore(state => state.login);
  const theme = useThemeStore(s => s.theme);

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

  const styles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="restaurant"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your POS terminal</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter PIN / Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <KeyboardButton
            label={loading ? 'Authenticating...' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            variant="primary"
            width="100%"
            icon={
              !loading ? (
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.textInverse}
                />
              ) : undefined
            }
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Quick Fill (Dev Only)</Text>
          <View style={styles.tagContainer}>
            <TouchableOpacity
              style={styles.tag}
              onPress={() => {
                setPhone('8668229890');
                setPassword('6344');
              }}
            >
              <Text style={styles.tagText}>Sankalesh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tag}
              onPress={() => {
                setPhone('9588413799');
                setPassword('6344');
              }}
            >
              <Text style={styles.tagText}>Datta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      maxWidth: 500,
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: theme.colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      padding: 24,
      borderRadius: 24,
      ...theme.shadows.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 56,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.primary,
      height: '100%',
    },

    footer: {
      marginTop: 40,
      alignItems: 'center',
    },
    footerTitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    tagContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    tag: {
      backgroundColor: theme.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 100,
    },
    tagText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

export default POSLoginScreen;
