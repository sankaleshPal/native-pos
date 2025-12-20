import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getAllBills } from '../db/services/billService';
import { Bill } from '../db/types';
import BillDetailModal from '../components/BillDetailModal';

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadBills();

    // Refresh when focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadBills();
    });

    return unsubscribe;
  }, [navigation]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const allBills = await getAllBills();

      // Filter for today's bills
      const today = new Date().toISOString().split('T')[0];
      const todaysBills = allBills.filter(bill =>
        bill.created_at?.startsWith(today),
      );

      setBills(todaysBills);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBillPress = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailModalVisible(true);
  };

  const renderBillItem = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      style={styles.billCard}
      onPress={() => handleBillPress(item)}
    >
      <View style={styles.billHeader}>
        <Text style={styles.billId}>Bill #{item.id}</Text>
        <Text
          style={[
            styles.statusBadge,
            { color: item.status === 'settled' ? 'green' : 'orange' },
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.billRow}>
        <Text style={styles.billTable}>{item.table_name}</Text>
        <Text style={styles.billTime}>
          {item.created_at
            ? new Date(item.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
        </Text>
      </View>

      <View style={styles.billFooter}>
        <Text style={styles.paymentMode}>{item.payment_mode || 'Unpaid'}</Text>
        <Text style={styles.billTotal}>₹{item.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <Ionicons name="menu" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sales History</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Today's Sales: ₹
          {bills.reduce((sum, b) => sum + b.total, 0).toFixed(2)}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : bills.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No sales recorded today.</Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderBillItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadBills}
        />
      )}

      {selectedBill && (
        <BillDetailModal
          visible={detailModalVisible}
          onClose={() => setDetailModalVisible(false)}
          bill={selectedBill}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },
  listContent: {
    padding: 16,
  },
  billCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billId: {
    fontWeight: 'bold',
    color: '#374151',
  },
  statusBadge: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billTable: {
    fontSize: 16,
    color: '#111827',
  },
  billTime: {
    color: '#6B7280',
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentMode: {
    color: '#6B7280',
    fontSize: 14,
  },
  billTotal: {
    fontSize: 18,
    color: '#7C3AED',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
});

export default HistoryScreen;
