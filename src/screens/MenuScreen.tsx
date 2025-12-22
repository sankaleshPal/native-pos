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
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';
import type { Category, Dish } from '../db/types';
import { useCategories, useDishes } from '../hooks/useMenu';
import CategoryItem from './MenuScreen/components/CategoryItem';
import DishItem from './MenuScreen/components/DishItem';

const MenuScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};
  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Use Custom Hooks (TanStack Query)
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: dishes = [], isLoading: dishesLoading } = useDishes(
    selectedCategory?.id || null,
  );

  const { setTableInfo, getCartItemCount, getCartTotal } = useCartStore();
  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (table) {
      setTableInfo(table.table_name);
    }
  }, []);

  const getFilteredDishes = () => {
    if (searchQuery.trim() === '') {
      return dishes;
    }
    return dishes.filter(dish =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filteredDishes = getFilteredDishes();
  const loading =
    categoriesLoading ||
    (selectedCategory && dishesLoading && dishes.length === 0);

  if (loading && !selectedCategory) {
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
              color={theme.colors.textInverse}
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
            {categories.map(cat => (
              <CategoryItem
                key={cat.id}
                category={cat}
                isSelected={selectedCategory?.id === cat.id}
                onPress={setSelectedCategory}
                theme={theme}
              />
            ))}
          </ScrollView>
        </View>

        {/* Dishes List */}
        <View style={styles.dishesContainer}>
          {dishesLoading && !searchQuery ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredDishes}
              renderItem={({ item }) => <DishItem item={item} theme={theme} />}
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
          )}
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
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 48,
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
      color: theme.colors.textInverse,
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
    dishesContainer: {
      flex: 1,
    },
    dishesList: {
      padding: 16,
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
      backgroundColor: theme.colors.textInverse,
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
      color: theme.colors.textInverse,
      fontSize: 18,
      fontWeight: '700',
    },
    cartTotal: {
      color: theme.colors.textInverse,
      fontSize: 20,
      fontWeight: '700',
    },
  });

export default MenuScreen;
