import React, { useState } from 'react';
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
import KOTCard from '../components/KOTCard';
import KOTOptionsModal from '../components/KOTOptionsModal';
import DeleteItemModal from '../components/DeleteItemModal';
import RefreshButton from '../components/RefreshButton';
import type { KOTWithItems } from '../db/types';
import { useThemeStore } from '../store/themeStore';
import { Theme } from '../theme/types';

type TabType = 'add_more' | 'kot_history' | 'bill';

interface KOTScreenState {
  selectedTab: TabType;
  kots: KOTWithItems[];
  loading: boolean;
  setSelectedTab: (tab: TabType) => void;
  setLoading: (loading: boolean) => void;
}

const useKOTScreenStore = create<KOTScreenState>()(set => ({
  selectedTab: 'kot_history',
  kots: [],
  loading: false,
  setSelectedTab: tab => set({ selectedTab: tab }),
  setLoading: loading => set({ loading }),
}));

const KOTScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { table } = route.params || {};
  const [activeTab, setActiveTab] = useState('Active');
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const { theme } = useThemeStore();
  const styles = getStyles(theme);

  // React Query Hooks
  const { data: kots = [], isLoading, refetch } = useKOTs(table?.id);
  const deleteKOTItemMutation = useDeleteKOTItem();

  const { selectedTab, setSelectedTab } = useKOTScreenStore();

  // Use local loading state from hook
  const loading = isLoading;

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
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading KOTs...</Text>
        </View>
      );
    }

    if (kots.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="receipt-outline"
            size={80}
            color={theme.colors.textMuted}
          />
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
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textInverse}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{table?.table_name || 'Table'}</Text>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => setSessionModalVisible(true)}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={theme.colors.textInverse}
          />
        </TouchableOpacity>
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
            color={
              selectedTab === 'add_more'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
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
            color={
              selectedTab === 'kot_history'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
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
            color={
              selectedTab === 'bill'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
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
    totalBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    totalText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
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
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textMuted,
      marginTop: 8,
      fontFamily: 'Ubuntu-Regular',
    },
    kotList: {
      flex: 1,
      padding: 16,
    },
    bottomNav: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingBottom: 8,
      ...theme.shadows.level1,
    },
    navButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonActive: {
      borderTopWidth: 3,
      borderTopColor: theme.colors.primary,
    },
    navButtonText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontFamily: 'Ubuntu-Regular',
    },
    navButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontFamily: 'Ubuntu-Bold',
    },
  });

export default KOTScreen;
