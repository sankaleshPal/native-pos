import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatKOTDateTime } from '../utils/timeUtils';
import { useModalStore } from '../store/modalStore';
import type { KOTWithItems } from '../db/types';

interface KOTCardProps {
  kot: KOTWithItems;
}

const KOTCard: React.FC<KOTCardProps> = ({ kot }) => {
  const { showKOTOptions } = useModalStore();

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
          <Ionicons name="options-outline" size={24} color="#7C3AED" />
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  punchedBy: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Ubuntu-Bold',
  },
  dateTime: {
    fontSize: 12,
    color: '#6B7280',
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
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Ubuntu-Bold',
  },
  itemDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Ubuntu-Regular',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Ubuntu-Regular',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  deletedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
  },
  deletedHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
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
    color: '#991B1B',
    textDecorationLine: 'line-through',
    fontFamily: 'Ubuntu-Regular',
  },
  deletedItemQuantity: {
    fontSize: 12,
    color: '#991B1B',
    textDecorationLine: 'line-through',
    fontFamily: 'Ubuntu-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default KOTCard;
