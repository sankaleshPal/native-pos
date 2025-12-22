import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatKOTDateTime } from '../utils/timeUtils';
import { useModalStore } from '../store/modalStore';
import { useThemeStore } from '../store/themeStore';
import type { KOTWithItems } from '../db/types';
import { Theme } from '../theme/types';

interface KOTCardProps {
  kot: KOTWithItems;
}

const KOTCard: React.FC<KOTCardProps> = ({ kot }) => {
  const { showKOTOptions } = useModalStore();
  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  const activeItems = kot.items.filter(item => !item.is_deleted);
  const deletedItems = kot.items.filter(item => item.is_deleted);

  const calculateTotal = () => {
    return activeItems.reduce((sum, item) => sum + item.item_total, 0);
  };

  const parseExtras = (extrasJson: string) => {
    try {
      return JSON.parse(extrasJson);
    } catch {
      return [];
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.punchedBy}>Punched by: {kot.punched_by}</Text>
          <Text style={styles.dateTime}>
            {formatKOTDateTime(kot.punched_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.equalizerButton}
          onPress={() => showKOTOptions(kot.id)}
        >
          <Ionicons
            name="options-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Items */}
      <View style={styles.itemsContainer}>
        {activeItems.map(item => {
          const extras = parseExtras(item.extras);
          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.dish_name}</Text>
                {item.portion_name && (
                  <Text style={styles.itemDetail}>
                    Portion: {item.portion_name}
                  </Text>
                )}
                {extras.length > 0 && (
                  <Text style={styles.itemDetail}>
                    Add-ons:{' '}
                    {extras
                      .map((e: any) => `${e.name} (${e.quantity})`)
                      .join(', ')}
                  </Text>
                )}
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.item_total}</Text>
              </View>
            </View>
          );
        })}

        {/* Deleted Items */}
        {deletedItems.length > 0 && (
          <View style={styles.deletedSection}>
            <Text style={styles.deletedHeader}>Deleted Items:</Text>
            {deletedItems.map(item => (
              <View key={item.id} style={styles.deletedItemRow}>
                <Text style={styles.deletedItemName}>{item.dish_name}</Text>
                <Text style={styles.deletedItemQuantity}>x{item.quantity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {activeItems.length} item{activeItems.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.footerTotal}>₹{calculateTotal().toFixed(2)}</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.level1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flex: 1,
    },
    punchedBy: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
      fontFamily: 'Ubuntu-Bold',
    },
    dateTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    equalizerButton: {
      padding: 4,
    },
    itemsContainer: {
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemInfo: {
      flex: 1,
      marginRight: 12,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 2,
      fontFamily: 'Ubuntu-Bold',
    },
    itemDetail: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      fontFamily: 'Ubuntu-Regular',
    },
    itemRight: {
      alignItems: 'flex-end',
    },
    itemQuantity: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      fontFamily: 'Ubuntu-Regular',
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      fontFamily: 'Ubuntu-Bold',
    },
    deletedSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.error,
      backgroundColor: 'transparent',
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deletedHeader: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.error,
      marginBottom: 8,
      fontFamily: 'Ubuntu-Bold',
    },
    deletedItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    deletedItemName: {
      fontSize: 12,
      color: theme.colors.error,
      textDecorationLine: 'line-through',
      fontFamily: 'Ubuntu-Regular',
    },
    deletedItemQuantity: {
      fontSize: 12,
      color: theme.colors.error,
      textDecorationLine: 'line-through',
      fontFamily: 'Ubuntu-Regular',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    footerTotal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontFamily: 'Ubuntu-Bold',
    },
  });

export default KOTCard;
