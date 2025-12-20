import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getAllBills } from '../db/services/billService';
import { Bill } from '../db/types';
import BillDetailModal from '../components/BillDetailModal';
import { useThemeStore } from '../store/themeStore';

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { theme, isDarkMode } = useThemeStore();

  const styles = getStyles(theme);

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
        <View style={styles.billIdContainer}>
          <View style={styles.iconBox}>
            <Ionicons name="receipt" size={18} color={theme.colors.primary} />
          </View>
          <Text style={styles.billId}>Bill #{item.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'settled'
                  ? theme.colors.success + '20'
                  : theme.colors.warning + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === 'settled'
                    ? theme.colors.success
                    : theme.colors.warning,
              },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
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
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={styles.menuButton}
          >
            <Ionicons
              name="menu"
              size={28}
              color={theme.colors.primaryForeground}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sales History</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsLabel}>Total Sales (Today)</Text>
          <Text style={styles.headerSubtitle}>
            ₹{bills.reduce((sum, b) => sum + b.total, 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : bills.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
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

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 24,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      paddingTop: 16,
      ...theme.shadows.card,
      zIndex: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primaryForeground,
    },
    subtitle: {
      marginTop: 5,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    listContent: {
      padding: 20,
      paddingTop: 30, // Overlap effect
    },
    billCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      ...theme.shadows.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    billHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    billIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    billId: {
      fontWeight: '600',
      color: theme.colors.text,
      fontSize: 16,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    billRow: {
      marginBottom: 12,
    },
    billTable: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    billTime: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    billFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    paymentMode: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    billTotal: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 24,
    },
    menuButton: {
      padding: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    statsLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: '500',
    },
    headerSubtitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primaryForeground,
    },
  });

export default HistoryScreen;
