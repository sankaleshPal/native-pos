import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
  color?: string;
  style?: any;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  loading = false,
  color = '#FFFFFF',
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onRefresh}
      style={[styles.button, style]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name="refresh" size={24} color={color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RefreshButton;
