import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { create } from 'zustand';
import { settleBill } from '../db/services/billService';
import { useBill, useSettleBill, useCreateBill } from '../hooks/useDatabase';
import { Bill, KOT, KOTItem, BillWithKOTs, PaymentMode } from '../db/types';
import { formatKOTDateTime } from '../utils/timeUtils';
import { useModalStore } from '../store/modalStore';
import { usePOSStore } from '../store/posStore';
import PaymentModeModal from '../components/PaymentModeModal';
import RefreshButton from '../components/RefreshButton';

interface BillScreenState {
  bill: BillWithKOTs | null;
  loading: boolean;
  settling: boolean;
  setBill: (bill: BillWithKOTs | null) => void;
  setLoading: (loading: boolean) => void;
  setSettling: (settling: boolean) => void;
}

const useBillScreenStore = create<BillScreenState>()(set => ({
  bill: null,
  loading: false,
  settling: false,
  setBill: bill => set({ bill }),
  setLoading: loading => set({ loading }),
  setSettling: settling => set({ settling }),
}));

const BillScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};

  const {
    bill: storedBill,
    loading,
    settling,
    setBill,
    setLoading,
    setSettling,
  } = useBillScreenStore();
  const { showPaymentModal } = useModalStore();
  const { currentUser } = usePOSStore();

  // React Query Hooks
  const { data: billData, isLoading, refetch } = useBill(table?.id);
  const settleBillMutation = useSettleBill();
  const createBillMutation = useCreateBill();

  // Use data from React Query
  const bill = billData || null;

  // Sync loading state if needed by store, or just use isLoading local var
  // For now, we ignore store loading/bill state for fetching and use RQ directly

  // Auto-create bill if it doesn't exist
  useEffect(() => {
    if (
      table?.id &&
      !isLoading &&
      !bill &&
      !createBillMutation.isPending &&
      !createBillMutation.isSuccess
    ) {
      createBillMutation.mutate(table.id);
    }
  }, [
    table?.id,
    isLoading,
    bill,
    createBillMutation.isPending,
    createBillMutation.isSuccess,
  ]);

  /* 
  // Old loadOrCreateBill logic removed
  */

  const handleSettle = () => {
    showPaymentModal();
  };

  const handleConfirmPayment = async (paymentMode: PaymentMode) => {
    if (!bill || !currentUser) return;

    setSettling(true);
    try {
      await settleBillMutation.mutateAsync({
        billId: bill.id,
        paymentMode,
        settledBy: currentUser.name,
        tableId: table.id,
      });

      Alert.alert('Success', 'Bill settled successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to tables screen
            navigation.navigate('Dashboard', { screen: 'Tables' });
          },
        },
      ]);
    } catch (error) {
      console.error('Error settling bill:', error);
      Alert.alert('Error', 'Failed to settle bill');
    } finally {
      setSettling(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading bill...</Text>
        </View>
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>No bill available</Text>
        </View>
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
          <Text style={styles.headerTitle}>Bill</Text>
          <Text style={styles.headerSubtitle}>{bill.table_name}</Text>
        </View>
        <RefreshButton
          onRefresh={async () => {
            await refetch();
          }}
          loading={isLoading}
          style={{
            marginRight: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        />
        <View style={styles.billBadge}>
          <Text style={styles.billNumber}>#{bill.id}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KOTs Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KOTs ({bill.kots.length})</Text>
          {bill.kots.map(kot => {
            const kotSubtotal = kot.items
              .filter((item: KOTItem) => !item.is_deleted)
              .reduce((sum: number, item: KOTItem) => sum + item.item_total, 0);

            const activeItems = kot.items.filter(
              (item: KOTItem) => !item.is_deleted,
            );
            const kotTotal = kotSubtotal;

            return (
              <View key={kot.id} style={styles.kotSummary}>
                <View style={styles.kotHeader}>
                  <Text style={styles.kotId}>KOT #{kot.id}</Text>
                  <Text style={styles.kotTime}>
                    {formatKOTDateTime(kot.punched_at)}
                  </Text>
                </View>
                <View style={styles.kotDetails}>
                  <Text style={styles.kotItems}>
                    {activeItems.length} items
                  </Text>
                  <Text style={styles.kotTotal}>₹{kotTotal.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bill Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{bill.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (5%)</Text>
            <Text style={styles.totalValue}>₹{bill.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₹{bill.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.settleButton}
          onPress={handleSettle}
          disabled={settling}
        >
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settleGradient}
          >
            {settling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.settleText}>
                Settle Bill • ₹{bill.total.toFixed(2)}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <PaymentModeModal onConfirm={handleConfirmPayment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#E9D5FF',
    marginTop: 4,
    fontFamily: 'Ubuntu-Regular',
  },
  billBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  billNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 16,
    fontFamily: 'Ubuntu-Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Ubuntu-Bold',
  },
  kotSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  kotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kotId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  kotTime: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  kotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kotItems: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  kotTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  totalsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Ubuntu-Regular',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  grandTotalRow: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Ubuntu-Bold',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  settleButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settleGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  settleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default BillScreen;
