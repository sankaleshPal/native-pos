import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DishQuantityButton from '../../../components/DishQuantityButton';
import type { Dish } from '../../../db/types';

interface DishItemProps {
  item: Dish;
  theme: any;
}

const DishItem: React.FC<DishItemProps> = ({ item, theme }) => {
  const getDishTypeColor = (dishType: string) => {
    switch (dishType) {
      case 'VEG':
        return theme.colors.success;
      case 'NON_VEG':
        return theme.colors.error;
      case 'EGG':
        return theme.colors.warning;
      case 'VEGAN':
        return theme.colors.success; // Reusing success for vegan
      default:
        return theme.colors.textSecondary;
    }
  };

  const typeColor = getDishTypeColor(item.dish_type);
  const styles = getStyles(theme);

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

const getStyles = (theme: any) =>
  StyleSheet.create({
    dishCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.level1,
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
      color: theme.colors.textPrimary,
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
  });

export default React.memo(DishItem);
