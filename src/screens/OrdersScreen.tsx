import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useOrderStore, Order } from '../store/orderStore';
import { useThemeStore } from '../store/themeStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const OrdersScreen = () => {
  const { orders, acceptOrder } = useOrderStore();
  const { theme } = useThemeStore();
  const navigation = useNavigation();

  const newOrders = orders.filter(o => o.status === 'NEW');

  const handleAccept = (orderId: string) => {
    acceptOrder(orderId);
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.tableBadge}>
          <Text style={styles.tableText}>Table {item.tableNumber}</Text>
        </View>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>

      <Text style={[styles.user, { color: theme.colors.textPrimary }]}>
        Guest: {item.userName}
      </Text>

      <View style={styles.divider} />

      <View style={styles.itemsContainer}>
        {item.items.map((food, index) => (
          <Text
            key={index}
            style={[styles.itemText, { color: theme.colors.textSecondary }]}
          >
            {food.quantity}x {food.name}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleAccept(item.id)}
      >
        <Text style={styles.acceptButtonText}>ACCEPT ORDER</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>
          Incoming Orders ({newOrders.length})
        </Text>
      </View>

      <FlatList
        data={newOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              No new orders
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableBadge: {
    backgroundColor: '#FFD700', // Gold/Yellow for visibility
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tableText: {
    fontWeight: 'bold',
    color: '#000',
  },
  time: {
    fontSize: 12,
  },
  user: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  acceptButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default OrdersScreen;
