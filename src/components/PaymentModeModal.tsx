import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useModalStore } from '../store/modalStore';
import type { PaymentMode } from '../db/types';

interface PaymentModeModalProps {
  onConfirm: (mode: PaymentMode) => void;
}

const PaymentModeModal: React.FC<PaymentModeModalProps> = ({ onConfirm }) => {
  const {
    paymentModalVisible,
    selectedPaymentMode,
    hidePaymentModal,
    setPaymentMode,
  } = useModalStore();

  const paymentModes: { mode: PaymentMode; icon: string; color: string }[] = [
    { mode: 'UPI', icon: 'qr-code-outline', color: '#7C3AED' },
    { mode: 'Cash', icon: 'cash-outline', color: '#10B981' },
    { mode: 'Swiggy', icon: 'restaurant-outline', color: '#FC8019' },
    { mode: 'Zomato', icon: 'fast-food-outline', color: '#E23744' },
  ];

  const handleConfirm = () => {
    if (selectedPaymentMode) {
      onConfirm(selectedPaymentMode);
      hidePaymentModal();
    }
  };

  return (
    <Modal
      visible={paymentModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={hidePaymentModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Payment Mode</Text>
            <TouchableOpacity onPress={hidePaymentModal}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Payment Modes */}
          <View style={styles.modesContainer}>
            {paymentModes.map(({ mode, icon, color }) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  selectedPaymentMode === mode && styles.modeButtonSelected,
                ]}
                onPress={() => setPaymentMode(mode)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${color}20` },
                  ]}
                >
                  <Ionicons name={icon as any} size={32} color={color} />
                </View>
                <Text style={styles.modeText}>{mode}</Text>
                {selectedPaymentMode === mode && (
                  <View style={styles.checkmark}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#7C3AED"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedPaymentMode && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedPaymentMode}
          >
            <LinearGradient
              colors={
                selectedPaymentMode
                  ? ['#7C3AED', '#A855F7']
                  : ['#9CA3AF', '#6B7280']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              <Text style={styles.confirmText}>Confirm & Settle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  modesContainer: {
    padding: 20,
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  checkmark: {
    marginLeft: 8,
  },
  confirmButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default PaymentModeModal;
