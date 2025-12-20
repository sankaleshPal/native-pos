import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { create } from 'zustand';
import { usePOSStore } from '../store/posStore';
import { useModalStore } from '../store/modalStore';
import { useKOTs, useDeleteKOTItem } from '../hooks/useDatabase';
import { prepareKOTPrintData } from '../db/services/kotService';
import { formatElapsedTime } from '../utils/timeUtils';
import KOTCard from '../components/KOTCard';
import KOTOptionsModal from '../components/KOTOptionsModal';
import DeleteItemModal from '../components/DeleteItemModal';
import RefreshButton from '../components/RefreshButton';
import TableSessionModal from '../components/TableSessionModal';
import type { KOTWithItems, Table } from '../db/types';

type TabType = 'add_more' | 'kot_history' | 'bill';

interface KOTScreenState {
  selectedTab: TabType;
  kots: KOTWithItems[];
  loading: boolean;
  setSelectedTab: (tab: TabType) => void;
  setKOTs: (kots: KOTWithItems[]) => void;
  setLoading: (loading: boolean) => void;
}

const useKOTScreenStore = create<KOTScreenState>()(set => ({
  selectedTab: 'kot_history',
  kots: [],
  loading: false,
  setSelectedTab: tab => set({ selectedTab: tab }),
  setKOTs: kots => set({ kots }),
  setLoading: loading => set({ loading }),
}));

const KOTScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};
  const [activeTab, setActiveTab] = useState('Active');
  const [sessionModalVisible, setSessionModalVisible] = useState(false);

  // React Query Hooks
  const { data: kots = [], isLoading, refetch } = useKOTs(table?.id);
  const deleteKOTItemMutation = useDeleteKOTItem();

  const { currentUser } = usePOSStore();
  const { showDeleteItem, selectedItemIds } = useModalStore();
  const [selectedKOTId, setSelectedKOTId] = useState<number | null>(null);

  /* const { selectedTab, loading, setSelectedTab, setKOTs, setLoading } =
    useKOTScreenStore(); */
  const { selectedTab, setSelectedTab } = useKOTScreenStore();

  // Use local loading state from hook
  const loading = isLoading;

  /* // Sync kots state for compatibility - CAUSES INFINITE LOOP
  useEffect(() => {
    setKOTs(kots);
    setLoading(isLoading);
  }, [kots, isLoading, setKOTs, setLoading]); */

  // NOTE: loadKOTs function is removed as useKOTs hook handles fetching

  const handleAddMore = () => {
    navigation.navigate('Menu', { table });
  };

  const handleViewBill = () => {
    navigation.navigate('Bill', { table });
  };

  const renderKOTHistory = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading KOTs...</Text>
        </View>
      );
    }

    if (kots.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>No KOTs yet</Text>
          <Text style={styles.emptySubtext}>
            Add items to create your first KOT
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.kotList} showsVerticalScrollIndicator={false}>
        {kots.map(kot => (
          <KOTCard key={kot.id} kot={kot} />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {table?.table_name || 'Table'} - {table?.table_code || ''}
        </Text>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => setSessionModalVisible(true)}
        >
          <Ionicons name="time-outline" size={24} color="#333" />
        </TouchableOpacity>
        {/* Refresh Button */}
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
        {table?.current_total > 0 && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>
              ₹{table.current_total.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'kot_history' && renderKOTHistory()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedTab === 'add_more' && styles.navButtonActive,
          ]}
          onPress={handleAddMore}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={selectedTab === 'add_more' ? '#7C3AED' : '#6B7280'}
          />
          <Text
            style={[
              styles.navButtonText,
              selectedTab === 'add_more' && styles.navButtonTextActive,
            ]}
          >
            Add More
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            selectedTab === 'kot_history' && styles.navButtonActive,
          ]}
          onPress={() => setSelectedTab('kot_history')}
        >
          <Ionicons
            name="receipt-outline"
            size={24}
            color={selectedTab === 'kot_history' ? '#7C3AED' : '#6B7280'}
          />
          <Text
            style={[
              styles.navButtonText,
              selectedTab === 'kot_history' && styles.navButtonTextActive,
            ]}
          >
            KOT History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            selectedTab === 'bill' && styles.navButtonActive,
          ]}
          onPress={handleViewBill}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color={selectedTab === 'bill' ? '#7C3AED' : '#6B7280'}
          />
          <Text
            style={[
              styles.navButtonText,
              selectedTab === 'bill' && styles.navButtonTextActive,
            ]}
          >
            Bill
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <KOTOptionsModal />
      <DeleteItemModal />
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
  totalBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: 'Ubuntu-Bold',
  },
  content: {
    flex: 1,
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
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontFamily: 'Ubuntu-Regular',
  },
  kotList: {
    flex: 1,
    padding: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonActive: {
    borderTopWidth: 3,
    borderTopColor: '#7C3AED',
  },
  navButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Ubuntu-Regular',
  },
  navButtonTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
    fontFamily: 'Ubuntu-Bold',
  },
});

export default KOTScreen;
