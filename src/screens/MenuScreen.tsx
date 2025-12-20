import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getAllCategories,
  getDishesByCategory,
} from '../db/services/menuService';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';
import DishQuantityButton from '../components/DishQuantityButton';
import type { Category, Dish } from '../db/types';

const MenuScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};
  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { setTableInfo, getCartItemCount, getCartTotal } = useCartStore();
  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  useEffect(() => {
    loadCategories();
    if (table) {
      setTableInfo(table.table_name);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadDishes(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredDishes(filtered);
    }
  }, [searchQuery, dishes]);

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const loadDishes = async (categoryId: number) => {
    try {
      const dishList = await getDishesByCategory(categoryId);
      setDishes(dishList);
      setFilteredDishes(dishList);
    } catch (error) {
      console.error('Error loading dishes:', error);
    }
  };

  const getCategoryInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getDishTypeColor = (dishType: string) => {
    switch (dishType) {
      case 'VEG':
        return theme.colors.success;
      case 'NON_VEG':
        return theme.colors.error;
      case 'EGG':
        return theme.colors.warning;
      case 'VEGAN':
        return '#10B981';
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderCategory = (category: Category) => {
    const isSelected = selectedCategory?.id === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
        onPress={() => setSelectedCategory(category)}
      >
        <View
          style={[
            styles.categoryCircle,
            isSelected && styles.categoryCircleActive,
          ]}
        >
          <Text
            style={[
              styles.categoryInitial,
              isSelected && styles.categoryInitialActive,
            ]}
          >
            {getCategoryInitial(category.name)}
          </Text>
        </View>

        <Text
          style={[styles.categoryText, isSelected && styles.categoryTextActive]}
          numberOfLines={2}
        >
          {category.name}
        </Text>

        {isSelected && <View style={styles.categoryIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderDish = ({ item }: { item: Dish }) => {
    const typeColor = getDishTypeColor(item.dish_type);

    return (
      <View style={styles.dishCard}>
        <View
          style={[styles.dishTypeIndicator, { backgroundColor: typeColor }]}
        />

        <View style={styles.dishContent}>
          <Text style={styles.dishName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.dishInfoRow}>
            <View style={styles.dishTypeContainer}>
              <View
                style={[styles.dishTypeDot, { backgroundColor: typeColor }]}
              />
              <Text style={styles.dishTypeText}>{item.dish_type}</Text>
            </View>
            <Text style={styles.dishPrice}>₹{item.price}</Text>
          </View>

          {item.description && (
            <Text style={styles.dishDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.dishButtonContainer}>
          <DishQuantityButton dish={item} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.primaryForeground}
            />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {table?.table_name || 'Menu'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedCategory?.name || 'Select items'}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Categories Sidebar */}
        <View style={styles.categoriesSidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map(cat => renderCategory(cat))}
          </ScrollView>
        </View>

        {/* Dishes List */}
        <View style={styles.dishesContainer}>
          <FlatList
            data={filteredDishes}
            renderItem={renderDish}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.dishesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="restaurant-outline"
                  size={64}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No dishes found'
                    : 'No dishes in this category'}
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {/* Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButtonContainer}
          onPress={() => navigation.navigate('Cart', { table })}
        >
          <View style={styles.cartButton}>
            <View style={styles.cartInfo}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
              <Text style={styles.cartText}>View Cart</Text>
            </View>
            <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 16,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      ...theme.shadows.card,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButton: {
      marginRight: 16,
      padding: 4,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primaryForeground,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      marginTop: 8,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      height: '100%',
    },
    content: {
      flex: 1,
      flexDirection: 'row',
    },
    categoriesSidebar: {
      width: 100,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    categoryItem: {
      padding: 12,
      alignItems: 'center',
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    categoryItemActive: {
      backgroundColor: theme.colors.surfaceHighlight,
      borderLeftColor: theme.colors.primary,
    },
    categoryCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryCircleActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryInitial: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    categoryInitialActive: {
      color: theme.colors.primaryForeground,
    },
    categoryText: {
      fontSize: 11,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    categoryTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    categoryIndicator: {
      position: 'absolute',
      right: 0,
      top: '50%',
      marginTop: -12,
      width: 4,
      height: 24,
      backgroundColor: theme.colors.primary,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
    },
    dishesContainer: {
      flex: 1,
    },
    dishesList: {
      padding: 16,
    },
    dishCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dishTypeIndicator: {
      width: 4,
      borderRadius: 4,
      marginRight: 12,
    },
    dishContent: {
      flex: 1,
    },
    dishName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    dishInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    dishTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dishTypeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    dishTypeText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    dishPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    dishDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    dishButtonContainer: {
      justifyContent: 'center',
      marginLeft: 12,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    cartButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    cartButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...theme.shadows.card,
      elevation: 8,
    },
    cartInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cartBadge: {
      backgroundColor: theme.colors.primaryForeground,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 12,
    },
    cartBadgeText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    cartText: {
      color: theme.colors.primaryForeground,
      fontSize: 18,
      fontWeight: '700',
    },
    cartTotal: {
      color: theme.colors.primaryForeground,
      fontSize: 20,
      fontWeight: '700',
    },
  });

export default MenuScreen;
