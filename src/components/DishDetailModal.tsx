import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getDishWithDetails } from '../db/services/menuService';
import { useCartStore } from '../store/cartStore';
import type {
  DishWithDetails,
  Portion,
  AddOnChoice,
  CartExtra,
} from '../db/types';

interface DishDetailModalProps {
  visible: boolean;
  dishId: number | null;
  onClose: () => void;
}

const DishDetailModal: React.FC<DishDetailModalProps> = ({
  visible,
  dishId,
  onClose,
}) => {
  const [dish, setDish] = useState<DishWithDetails | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<Portion | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Map<number, number>>(
    new Map(),
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const { addToCart, getLastAddedVariant } = useCartStore();

  useEffect(() => {
    if (visible && dishId) {
      loadDishDetails();
    } else {
      resetState();
    }
  }, [visible, dishId]);

  const loadDishDetails = async () => {
    if (!dishId) return;

    setLoading(true);
    try {
      const details = await getDishWithDetails(dishId);
      setDish(details);

      // Set default portion
      if (details?.portions.length) {
        const defaultPortion =
          details.portions.find(p => p.is_default) || details.portions[0];
        setSelectedPortion(defaultPortion);
      }
    } catch (error) {
      console.error('Error loading dish details:', error);
      Alert.alert('Error', 'Failed to load dish details');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setDish(null);
    setSelectedPortion(null);
    setSelectedExtras(new Map());
    setQuantity(1);
  };

  const handleExtraToggle = (choiceId: number, price: number) => {
    const newExtras = new Map(selectedExtras);

    if (newExtras.has(choiceId)) {
      const currentQty = newExtras.get(choiceId) || 0;
      newExtras.set(choiceId, currentQty + 1);
    } else {
      newExtras.set(choiceId, 1);
    }

    setSelectedExtras(newExtras);
  };

  const handleExtraDecrease = (choiceId: number) => {
    const newExtras = new Map(selectedExtras);
    const currentQty = newExtras.get(choiceId) || 0;

    if (currentQty <= 1) {
      newExtras.delete(choiceId);
    } else {
      newExtras.set(choiceId, currentQty - 1);
    }

    setSelectedExtras(newExtras);
  };

  const calculateTotal = () => {
    if (!selectedPortion) return 0;

    let total = selectedPortion.price;

    // Add extras
    if (dish?.addOns) {
      dish.addOns.forEach(addOn => {
        addOn.choices.forEach(choice => {
          const qty = selectedExtras.get(choice.id) || 0;
          total += choice.price * qty;
        });
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!dish || !selectedPortion) return;

    // Build extras array
    const extras: CartExtra[] = [];

    if (dish.addOns) {
      dish.addOns.forEach(addOn => {
        addOn.choices.forEach(choice => {
          const qty = selectedExtras.get(choice.id);
          if (qty) {
            extras.push({
              id: choice.id.toString(),
              name: choice.name,
              quantity: qty,
              price: choice.price,
            });
          }
        });
      });
    }

    addToCart(dish, selectedPortion, extras, quantity);
    Alert.alert('Success', 'Item added to cart!');
    onClose();
  };

  const handleRepeatLast = () => {
    if (!dish) return;

    const lastVariant = getLastAddedVariant(dish.id);
    if (!lastVariant) return;

    // Add the same variant with quantity 1
    addToCart(dish, lastVariant.portion, lastVariant.extras, 1);
    Alert.alert('Success', 'Previous variant added to cart!');
    onClose();
  };

  const getDishTypeIcon = (dishType: string) => {
    switch (dishType) {
      case 'VEG':
        return { icon: 'square', color: '#4CAF50' };
      case 'NON_VEG':
        return { icon: 'square', color: '#EF4444' };
      case 'EGG':
        return { icon: 'square', color: '#F59E0B' };
      default:
        return { icon: 'square', color: '#9CA3AF' };
    }
  };

  if (!dish) return null;

  const typeInfo = getDishTypeIcon(dish.dish_type);

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
            <View style={styles.dishTitleContainer}>
              <Ionicons name={typeInfo.icon} size={16} color={typeInfo.color} />
              <Text style={styles.modalTitle}>{dish.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Description */}
            {dish.description && (
              <Text style={styles.description}>{dish.description}</Text>
            )}

            {/* Portions */}
            {dish.portions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Portion</Text>
                {dish.portions.map(portion => (
                  <TouchableOpacity
                    key={portion.id}
                    style={[
                      styles.portionOption,
                      selectedPortion?.id === portion.id &&
                        styles.portionOptionSelected,
                    ]}
                    onPress={() => setSelectedPortion(portion)}
                  >
                    <View style={styles.portionInfo}>
                      <Text
                        style={[
                          styles.portionName,
                          selectedPortion?.id === portion.id &&
                            styles.portionNameSelected,
                        ]}
                      >
                        {portion.name}
                      </Text>
                      {!!portion.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.portionPrice,
                        selectedPortion?.id === portion.id &&
                          styles.portionPriceSelected,
                      ]}
                    >
                      ₹{portion.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Add-ons */}
            {dish.addOns && dish.addOns.length > 0 && (
              <>
                {dish.addOns.map(addOn => (
                  <View key={addOn.id} style={styles.section}>
                    <View style={styles.addOnHeader}>
                      <Text style={styles.sectionTitle}>{addOn.name}</Text>
                      {!!addOn.compulsory && (
                        <Text style={styles.requiredText}>Required</Text>
                      )}
                    </View>

                    {addOn.choices.map(choice => {
                      const selectedQty = selectedExtras.get(choice.id) || 0;

                      return (
                        <View key={choice.id} style={styles.choiceOption}>
                          <View style={styles.choiceInfo}>
                            <Text style={styles.choiceName}>{choice.name}</Text>
                            <Text style={styles.choicePrice}>
                              {choice.price > 0 ? `+₹${choice.price}` : 'Free'}
                            </Text>
                          </View>

                          {selectedQty > 0 ? (
                            <View style={styles.quantityControl}>
                              <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => handleExtraDecrease(choice.id)}
                              >
                                <Ionicons
                                  name="remove"
                                  size={16}
                                  color="#7C3AED"
                                />
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>
                                {selectedQty}
                              </Text>
                              <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() =>
                                  handleExtraToggle(choice.id, choice.price)
                                }
                              >
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color="#7C3AED"
                                />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.addChoiceButton}
                              onPress={() =>
                                handleExtraToggle(choice.id, choice.price)
                              }
                            >
                              <Text style={styles.addChoiceText}>ADD</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </>
            )}

            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButtonLarge}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={24} color="#7C3AED" />
                </TouchableOpacity>
                <Text style={styles.quantityTextLarge}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButtonLarge}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={24} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            {!!getLastAddedVariant(dish.id) && (
              <TouchableOpacity
                style={styles.repeatLastButton}
                onPress={handleRepeatLast}
              >
                <Ionicons name="repeat-outline" size={20} color="#7C3AED" />
                <Text style={styles.repeatLastText}>Repeat Last</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !!getLastAddedVariant(dish.id) && styles.addToCartButtonSmall,
              ]}
              onPress={handleAddToCart}
            >
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addToCartGradient}
              >
                <Text style={styles.addToCartText}>
                  {getLastAddedVariant(dish.id) ? 'Add New' : 'Add to Cart'} • ₹
                  {calculateTotal().toFixed(2)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dishTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
    fontFamily: 'Ubuntu-Bold',
  },
  modalBody: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontFamily: 'Ubuntu-Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Ubuntu-Bold',
  },
  portionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  portionOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  portionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  portionName: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Ubuntu-Regular',
  },
  portionNameSelected: {
    fontWeight: '600',
    fontFamily: 'Ubuntu-Bold',
  },
  defaultBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  portionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    fontFamily: 'Ubuntu-Bold',
  },
  portionPriceSelected: {
    color: '#7C3AED',
  },
  addOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requiredText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Ubuntu-Medium',
  },
  choiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  choiceInfo: {
    flex: 1,
  },
  choiceName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Ubuntu-Regular',
  },
  choicePrice: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    fontFamily: 'Ubuntu-Bold',
  },
  quantityButtonLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityTextLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 24,
    fontFamily: 'Ubuntu-Bold',
  },
  addChoiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  addChoiceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  repeatLastButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
  },
  repeatLastText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addToCartButtonSmall: {
    flex: 1.5,
  },
  addToCartGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default DishDetailModal;
