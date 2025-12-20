import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  getAllCategories,
  getDishesByCategory,
} from '../db/services/menuService';
import { useCartStore } from '../store/cartStore';
import DishQuantityButton from '../components/DishQuantityButton';
import type { Category, Dish } from '../db/types';

const MenuScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const cats = await getAllCategories();
      console.log('Categories loaded:', cats.length, cats);
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
        console.log('Selected first category:', cats[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const loadDishes = async (categoryId: number) => {
    try {
      console.log('Loading dishes for category:', categoryId);
      const dishList = await getDishesByCategory(categoryId);
      console.log('Dishes loaded:', dishList.length, dishList);
      setDishes(dishList);
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
        return '#4CAF50';
      case 'NON_VEG':
        return '#EF4444';
      case 'EGG':
        return '#F59E0B';
      case 'VEGAN':
        return '#10B981';
      default:
        return '#9CA3AF';
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
        {/* Category Initial Circle */}
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

        {/* Category Name */}
        <Text
          style={[styles.categoryText, isSelected && styles.categoryTextActive]}
          numberOfLines={2}
        >
          {category.name}
        </Text>

        {/* Active Indicator */}
        {isSelected && <View style={styles.categoryIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderDish = ({ item }: { item: Dish }) => {
    const typeColor = getDishTypeColor(item.dish_type);

    return (
      <View style={styles.dishCard}>
        {/* Dish Type Indicator */}
        <View
          style={[styles.dishTypeIndicator, { backgroundColor: typeColor }]}
        />

        {/* Dish Content */}
        <View style={styles.dishContent}>
          {/* Dish Name */}
          <Text style={styles.dishName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Dish Type & Price Row */}
          <View style={styles.dishInfoRow}>
            <View style={styles.dishTypeContainer}>
              <View
                style={[styles.dishTypeDot, { backgroundColor: typeColor }]}
              />
              <Text style={styles.dishTypeText}>{item.dish_type}</Text>
            </View>
            <Text style={styles.dishPrice}>₹{item.price}</Text>
          </View>

          {/* Description */}
          {item.description && (
            <Text style={styles.dishDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        {/* Quantity Button */}
        <View style={styles.dishButtonContainer}>
          <DishQuantityButton dish={item} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
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
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{table?.table_name || 'Menu'}</Text>
          <Text style={styles.headerSubtitle}>
            {table?.table_code || 'Select items'}
          </Text>
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
            data={dishes}
            renderItem={renderDish}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.dishesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No dishes in this category</Text>
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
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartButton}
          >
            <View style={styles.cartInfo}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
              <Text style={styles.cartText}>View Cart</Text>
            </View>
            <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Ubuntu-Regular',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  categoriesSidebar: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 12,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  categoryItemActive: {
    backgroundColor: '#F3F4F6',
  },
  categoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryCircleActive: {
    backgroundColor: '#7C3AED',
  },
  categoryInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    fontFamily: 'Ubuntu-Bold',
  },
  categoryInitialActive: {
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Ubuntu-Regular',
  },
  categoryTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
    fontFamily: 'Ubuntu-Bold',
  },
  categoryIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#7C3AED',
  },
  dishesContainer: {
    flex: 1,
  },
  dishesList: {
    padding: 16,
    paddingBottom: 100,
  },
  dishCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dishTypeIndicator: {
    height: 4,
    width: '100%',
  },
  dishContent: {
    padding: 16,
    paddingBottom: 12,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'Ubuntu-Bold',
  },
  dishInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  dishPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  dishDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Ubuntu-Regular',
  },
  dishButtonContainer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dishExtrasInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  extraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  extraBadgeText: {
    fontSize: 11,
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Medium',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    fontFamily: 'Ubuntu-Regular',
  },
  cartButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  cartButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  cartBadgeText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Bold',
  },
  cartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Bold',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default MenuScreen;
