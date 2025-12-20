import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCartStore } from '../store/cartStore';
import { formatVariantDescription } from '../utils/cartHelpers';
import type { CartItem } from '../db/types';

interface VariantIncrementModalProps {
  visible: boolean;
  dishId: number | null;
  dishName: string;
  onClose: () => void;
  onAddNewVariant: () => void;
}

const VariantIncrementModal: React.FC<VariantIncrementModalProps> = ({
  visible,
  dishId,
  dishName,
  onClose,
  onAddNewVariant,
}) => {
  const { getCartItemsForDish, incrementVariant } = useCartStore();

  if (!dishId) return null;

  const variants = getCartItemsForDish(dishId);

  const handleSelectVariant = (itemId: string) => {
    incrementVariant(itemId);
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    onAddNewVariant();
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
            <Text style={styles.modalTitle}>Select Variant to Add</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.dishName}>{dishName}</Text>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Existing Variants */}
            {variants.map((item: CartItem) => (
              <TouchableOpacity
                key={item.id}
                style={styles.variantOption}
                onPress={() => handleSelectVariant(item.id)}
              >
                <View style={styles.variantInfo}>
                  <Text style={styles.variantDescription}>
                    {formatVariantDescription(item.portion, item.extras)}
                  </Text>
                  <Text style={styles.variantQuantity}>
                    Current: {item.quantity}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#7C3AED" />
              </TouchableOpacity>
            ))}

            {/* Add New Variant */}
            <TouchableOpacity
              style={styles.addNewOption}
              onPress={handleAddNew}
            >
              <View style={styles.addNewInfo}>
                <Ionicons name="add-circle-outline" size={24} color="#7C3AED" />
                <Text style={styles.addNewText}>Add New Variant</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#7C3AED" />
            </TouchableOpacity>
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
    marginBottom: 4,
    fontFamily: 'Ubuntu-Regular',
  },
  variantQuantity: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  addNewOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addNewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default VariantIncrementModal;
