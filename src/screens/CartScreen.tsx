import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePOSStore } from '../store/posStore';
import { useCartStore } from '../store/cartStore';
import { useCreateKOT } from '../hooks/useDatabase';
import SwipeToConfirm from '../components/SwipeToConfirm';
import { useThemeStore } from '../store/themeStore';
import { Theme } from '../theme/types';
import {
  formatVariantDescription,
  calculateItemTotal,
  groupCartItemsByDish,
} from '../utils/cartHelpers';
import type { CartItem } from '../db/types';

const CartScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};

  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  const {
    internalCart,
    getCartTotal,
    incrementVariant,
    decrementVariant,
    clearCart,
  } = useCartStore();
  console.log(internalCart);
  const createKOTMutation = useCreateKOT();

  const { currentUser } = usePOSStore();

  const groupedItems = groupCartItemsByDish(internalCart);
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const handlePunchKOT = async () => {
    console.log('handlePunchKOT started');
    // ... existing logs ...

    // Provide fallback data if missing
    const effectiveTable = table || {
      id: 1,
      table_name: 'Table 1',
      table_code: 'T1',
      zone_id: 1,
      capacity: 4,
      status: 'empty' as const,
    };

    const effectiveUser = currentUser || {
      id: 1,
      name: 'Default User',
      phone: '0000000000',
      password: 'admin',
    };

    if (internalCart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      // Create KOT
      await createKOTMutation.mutateAsync({
        tableId: effectiveTable.id,
        userId: effectiveUser.id?.toString() || '1',
        punchedBy: effectiveUser.name,
        cartItems: internalCart,
      });

      console.log('KOT created successfully');
      clearCart();
      navigation.replace('KOT', {
        table: { ...effectiveTable, status: 'active' },
      });
    } catch (error) {
      console.error('Error punching KOT:', error);
      Alert.alert('Error', 'Failed to punch KOT: ' + (error as Error).message);
    }
  };

  const renderVariant = (item: CartItem) => {
    const itemTotal = calculateItemTotal(item);

    return (
      <View key={item.id} style={styles.variantRow}>
        <View style={styles.variantInfo}>
          <Text style={styles.variantDescription}>
            {formatVariantDescription(item.portion, item.extras)}
          </Text>
          <Text style={styles.variantPrice}>₹{itemTotal}</Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decrementVariant(item.id)}
          >
            <Ionicons name="remove" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => incrementVariant(item.id)}
          >
            <Ionicons name="add" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDishGroup = (dishId: number, variants: CartItem[]) => {
    const dish = variants[0].dish;
    const dishTotal = variants.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0,
    );

    return (
      <View key={dishId} style={styles.dishGroup}>
        <View style={styles.dishHeader}>
          <Text style={styles.dishName}>{dish.name}</Text>
          <Text style={styles.dishTotal}>₹{dishTotal}</Text>
        </View>
        {variants.map(variant => renderVariant(variant))}
      </View>
    );
  };

  if (internalCart.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Ionicons
            name="cart-outline"
            size={80}
            color={theme.colors.textMuted}
          />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textInverse}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Cart ({internalCart.length} items)
        </Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Ionicons
            name="trash-outline"
            size={20}
            color={theme.colors.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Array.from(groupedItems.entries()).map(([dishId, variants]) =>
          renderDishGroup(dishId, variants),
        )}
      </ScrollView>

      {/* Footer with Totals */}
      <View style={styles.footer}>
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (5%)</Text>
            <Text style={styles.totalValue}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        <SwipeToConfirm onConfirm={handlePunchKOT} text="Swipe to Punch KOT" />
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 48,
      paddingBottom: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.level1,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.textInverse,
      fontFamily: 'Ubuntu-Bold',
    },
    clearButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    dishGroup: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...theme.shadows.level1,
    },
    dishHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dishName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      flex: 1,
      fontFamily: 'Ubuntu-Bold',
    },
    dishTotal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontFamily: 'Ubuntu-Bold',
    },
    variantRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    variantInfo: {
      flex: 1,
      marginRight: 12,
    },
    variantDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      fontFamily: 'Ubuntu-Regular',
    },
    variantPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      fontFamily: 'Ubuntu-Bold',
    },
    quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    quantityButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginHorizontal: 12,
      fontFamily: 'Ubuntu-Bold',
      minWidth: 20,
      textAlign: 'center',
    },
    footer: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      padding: 20,
    },
    totalsContainer: {
      marginBottom: 16,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    totalLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    totalValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      fontFamily: 'Ubuntu-Bold',
    },
    grandTotalRow: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: 4,
    },
    grandTotalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      fontFamily: 'Ubuntu-Bold',
    },
    grandTotalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontFamily: 'Ubuntu-Bold',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textMuted,
      marginTop: 16,
      marginBottom: 24,
      fontFamily: 'Ubuntu-Regular',
    },
    browseButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 12,
    },
    browseButtonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Ubuntu-Bold',
    },
  });

export default CartScreen;
