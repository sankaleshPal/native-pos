import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCartStore } from '../store/cartStore';
import { getDishWithDetails } from '../db/services/menuService';
import { getDefaultPortion, dishHasVariants } from '../utils/cartHelpers';
import DishDetailModal from './DishDetailModal';
import VariantDecrementModal from './VariantDecrementModal';
import type { Dish, DishWithDetails } from '../db/types';

interface DishQuantityButtonProps {
  dish: Dish;
}

const DishQuantityButton: React.FC<DishQuantityButtonProps> = ({ dish }) => {
  const {
    getTotalQuantityForDish,
    hasMultipleVariants,
    getCartItemsForDish,
    addToCart,
  } = useCartStore();

  const [showDishModal, setShowDishModal] = useState(false);
  const [showDecrementModal, setShowDecrementModal] = useState(false);
  const [dishDetails, setDishDetails] = useState<DishWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const totalQuantity = getTotalQuantityForDish(dish.id);
  const multipleVariants = hasMultipleVariants(dish.id);

  const loadDishDetails = async () => {
    setLoading(true);
    try {
      const details = await getDishWithDetails(dish.id);
      setDishDetails(details);
      return details;
    } catch (error) {
      console.error('Error loading dish details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const details = await loadDishDetails();
    if (!details) return;

    // If dish has portions or add-ons, show modal
    if (dishHasVariants(details)) {
      setShowDishModal(true);
    } else {
      // Add directly with default portion (or null if no portions)
      const defaultPortion = getDefaultPortion(details);
      addToCart(details, defaultPortion!, [], 1);
    }
  };

  const handleIncrement = async () => {
    // Always open dish modal to allow user to customize or repeat last
    const details = await loadDishDetails();
    if (details) {
      setShowDishModal(true);
    }
  };

  const handleDecrement = () => {
    if (multipleVariants) {
      // Show modal to select which variant to decrement
      setShowDecrementModal(true);
    } else {
      // Single variant - decrement directly
      const items = getCartItemsForDish(dish.id);
      if (items.length > 0) {
        const { decrementVariant } = useCartStore.getState();
        decrementVariant(items[0].id);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7C3AED" />
      </View>
    );
  }

  return (
    <>
      {totalQuantity === 0 ? (
        // Show ADD button
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      ) : (
        // Show quantity controls
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrement}
          >
            <Ionicons name="remove" size={16} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{totalQuantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrement}
          >
            <Ionicons name="add" size={16} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      )}

      {/* Dish Detail Modal */}
      {dishDetails && (
        <DishDetailModal
          visible={showDishModal}
          dishId={dishDetails.id}
          onClose={() => {
            setShowDishModal(false);
            setDishDetails(null);
          }}
        />
      )}

      {/* Variant Decrement Modal */}
      <VariantDecrementModal
        visible={showDecrementModal}
        dishId={dish.id}
        dishName={dish.name}
        onClose={() => setShowDecrementModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: 80,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7C3AED',
    minWidth: 80,
  },
  quantityButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 12,
    fontFamily: 'Ubuntu-Bold',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default DishQuantityButton;
