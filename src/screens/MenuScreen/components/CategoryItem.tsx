import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Category } from '../../../db/types';

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onPress: (category: Category) => void;
  theme: any;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isSelected,
  onPress,
  theme,
}) => {
  const getCategoryInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
      onPress={() => onPress(category)}
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

const getStyles = (theme: any) =>
  StyleSheet.create({
    categoryItem: {
      padding: 12,
      alignItems: 'center',
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    categoryItemActive: {
      backgroundColor: theme.colors.card,
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
      color: theme.colors.textInverse,
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
  });

export default React.memo(CategoryItem);
