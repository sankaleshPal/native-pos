import React from 'react';
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
import { useBill, useSettleBill } from '../hooks/useDatabase';
import { useThemeStore } from '../store/themeStore';
import { Theme } from '../theme/types';
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

// ... (imports remain same, remove zustand if redundant or keep if needed for store, it is used here)

const BillScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};
  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  const { settling, setSettling } = useBillScreenStore();
  const { showPaymentModal } = useModalStore();
  const { currentUser } = usePOSStore();

  // React Query Hooks
  const { data: billData, isLoading, refetch } = useBill(table?.id);
  const settleBillMutation = useSettleBill();

  // Use data from React Query
  const bill = billData || null;

  const handleSettle = () => {
    if (!bill) return;
    showPaymentModal();
  };

  const handleConfirmPayment = async (paymentMode: PaymentMode) => {
    if (!bill) return;
    setSettling(true);
    try {
      await settleBillMutation.mutateAsync({
        billId: bill.id,
        paymentMode,
        settledBy: currentUser?.name || 'Staff',
        tableId: table?.id,
      });
      Alert.alert('Success', 'Bill settled successfully');
      navigation.goBack();
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
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={80}
            color={theme.colors.textMuted}
          />
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
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textInverse}
          />
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
            backgroundColor: theme.colors.card,
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
            colors={[theme.colors.primary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settleGradient}
          >
            {settling ? (
              <ActivityIndicator color={theme.colors.textInverse} />
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

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
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
      color: theme.colors.textInverse,
      fontFamily: 'Ubuntu-Bold',
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textInverse,
      marginTop: 4,
      fontFamily: 'Ubuntu-Regular',
      opacity: 0.8,
    },
    billBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    billNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
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
      color: theme.colors.textSecondary,
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
      color: theme.colors.textMuted,
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
      color: theme.colors.textPrimary,
      marginBottom: 12,
      fontFamily: 'Ubuntu-Bold',
    },
    kotSummary: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.level1,
    },
    kotHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    kotId: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      fontFamily: 'Ubuntu-Bold',
    },
    kotTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    kotDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    kotItems: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    kotTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      fontFamily: 'Ubuntu-Bold',
    },
    totalsSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      ...theme.shadows.level1,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    totalLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: 'Ubuntu-Regular',
    },
    totalValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      fontFamily: 'Ubuntu-Bold',
    },
    grandTotalRow: {
      paddingTop: 12,
      borderTopWidth: 2,
      borderTopColor: theme.colors.border,
      marginTop: 4,
      marginBottom: 0,
    },
    grandTotalLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      fontFamily: 'Ubuntu-Bold',
    },
    grandTotalValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontFamily: 'Ubuntu-Bold',
    },
    footer: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
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
      color: theme.colors.textInverse,
      fontFamily: 'Ubuntu-Bold',
    },
  });

export default BillScreen;
