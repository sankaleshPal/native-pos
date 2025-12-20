import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCartStore } from '../store/cartStore';
import {
  formatVariantDescription,
  calculateItemTotal,
} from '../utils/cartHelpers';
import type { CartItem } from '../db/types';

interface VariantDecrementModalProps {
  visible: boolean;
  dishId: number | null;
  dishName: string;
  onClose: () => void;
}

const VariantDecrementModal: React.FC<VariantDecrementModalProps> = ({
  visible,
  dishId,
  dishName,
  onClose,
}) => {
  const { getCartItemsForDish, decrementVariant } = useCartStore();

  if (!dishId) return null;

  const variants = getCartItemsForDish(dishId);

  const handleSelectVariant = (item: CartItem) => {
    if (item.quantity === 1) {
      Alert.alert(
        'Remove Item',
        `Remove "${formatVariantDescription(
          item.portion,
          item.extras,
        )}" from cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              decrementVariant(item.id);
              onClose();
            },
          },
        ],
      );
    } else {
      decrementVariant(item.id);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Variant to Remove</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.dishName}>{dishName}</Text>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {variants.map((item: CartItem) => (
              <TouchableOpacity
                key={item.id}
                style={styles.variantOption}
                onPress={() => handleSelectVariant(item)}
              >
                <View style={styles.variantInfo}>
                  <Text style={styles.variantDescription}>
                    {formatVariantDescription(item.portion, item.extras)}
                  </Text>
                  <View style={styles.variantDetails}>
                    <Text style={styles.variantQuantity}>
                      Qty: {item.quantity}
                    </Text>
                    <Text style={styles.variantPrice}>
                      ₹{calculateItemTotal(item)}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={item.quantity === 1 ? 'trash-outline' : 'remove-circle'}
                  size={24}
                  color={item.quantity === 1 ? '#EF4444' : '#7C3AED'}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 12,
    fontFamily: 'Ubuntu-Medium',
  },
  modalBody: {
    padding: 20,
  },
  variantOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  variantInfo: {
    flex: 1,
  },
  variantDescription: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'Ubuntu-Regular',
  },
  variantDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  variantQuantity: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  variantPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default VariantDecrementModal;
