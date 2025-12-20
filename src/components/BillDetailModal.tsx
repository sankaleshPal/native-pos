import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Bill, BillWithKOTs } from '../db/types';
import { getBillById } from '../db/services/billService';

interface BillDetailModalProps {
  visible: boolean;
  onClose: () => void;
  bill: Bill;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({
  visible,
  onClose,
  bill,
}) => {
  const [loading, setLoading] = useState(true);
  const [fullBill, setFullBill] = useState<BillWithKOTs | null>(null);

  useEffect(() => {
    if (visible && bill.id) {
      fetchBillDetails();
    }
  }, [visible, bill]);

  const fetchBillDetails = async () => {
    setLoading(true);
    try {
      const data = await getBillById(bill.id);
      setFullBill(data);
    } catch (error) {
      console.error('Error fetching bill details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Bill Details #{bill.id}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#7C3AED"
              style={{ margin: 20 }}
            />
          ) : !fullBill ? (
            <Text>Failed to load details.</Text>
          ) : (
            <ScrollView style={styles.scroll}>
              {/* Header Info */}
              <View style={styles.infoSection}>
                <Text style={styles.label}>
                  Table: <Text style={styles.value}>{fullBill.table_name}</Text>
                </Text>
                <Text style={styles.label}>
                  Date:{' '}
                  <Text style={styles.value}>
                    {new Date(fullBill.created_at).toLocaleString()}
                  </Text>
                </Text>
                <Text style={styles.label}>
                  Status:{' '}
                  <Text
                    style={{
                      color: fullBill.status === 'settled' ? 'green' : 'orange',
                    }}
                  >
                    {fullBill.status.toUpperCase()}
                  </Text>
                </Text>
                {fullBill.payment_mode && (
                  <Text style={styles.label}>
                    Payment:{' '}
                    <Text style={styles.value}>{fullBill.payment_mode}</Text>
                  </Text>
                )}
              </View>

              {/* Items List */}
              <Text style={styles.sectionHeader}>Items</Text>
              {fullBill.kots.map(kot => (
                <View key={kot.id}>
                  {kot.items
                    .filter(i => !i.is_deleted)
                    .map(item => (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>
                            {item.dish_name}
                            {item.portion_name ? ` (${item.portion_name})` : ''}
                          </Text>
                          <Text style={styles.itemMeta}>
                            x{item.quantity} • ₹{item.portion_price}
                          </Text>
                        </View>
                        <Text style={styles.itemTotal}>₹{item.item_total}</Text>
                      </View>
                    ))}
                </View>
              ))}

              {/* Totals */}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>
                  ₹{fullBill.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.label}>GST (5%)</Text>
                <Text style={styles.value}>₹{fullBill.tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>
                  ₹{fullBill.total.toFixed(2)}
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: {
    marginBottom: 10,
  },
  infoSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  value: {
    color: '#333',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 15,
    color: '#333',
  },
  itemMeta: {
    fontSize: 12,
    color: '#999',
  },
  itemTotal: {
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
});

export default BillDetailModal;
