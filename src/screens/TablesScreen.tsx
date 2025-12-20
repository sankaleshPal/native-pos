import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePOSStore } from '../store/posStore';
import { useTablesWithZones, useUpdateTableStatus } from '../hooks/useDatabase';
import { prepareKOTPrintData } from '../db/services/kotService';
import { preparePrintData } from '../utils/printUtils';
import TableTimer from '../components/TableTimer';
import type { Table, ZoneWithTables } from '../db/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import RefreshButton from '../components/RefreshButton';

const TablesScreen = () => {
  const navigation = useNavigation<any>();
  const { data: zonesWithTables, isLoading, refetch } = useTablesWithZones();
  const updateStatusMutation = useUpdateTableStatus();
  const { logout, currentUser } = usePOSStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStartTableModal, setShowStartTableModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const handleLogout = () => {
    setShowProfileMenu(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleTablePress = (table: Table) => {
    // If table is empty, navigate to menu
    if (table.status === 'empty') {
      navigation.navigate('Menu', { table });
      return;
    }

    // If table is active, navigate to KOT screen
    navigation.navigate('KOT', { table });
  };

  const handleStartTable = (table: Table) => {
    setShowStartTableModal(false);
    setModalSearchQuery('');
    navigation.navigate('Menu', { table });
  };

  // Filter tables based on search query
  const filteredZones = zonesWithTables
    ?.map((zone: ZoneWithTables) => ({
      ...zone,
      tables: zone.tables.filter(
        (table: Table) =>
          table.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          table.table_code.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter(zone => zone.tables.length > 0);

  // Get all empty tables for the modal
  const emptyTables =
    zonesWithTables?.flatMap((zone: ZoneWithTables) =>
      zone.tables
        .filter((table: Table) => table.status === 'empty')
        .filter(
          table =>
            table.table_name
              .toLowerCase()
              .includes(modalSearchQuery.toLowerCase()) ||
            table.table_code
              .toLowerCase()
              .includes(modalSearchQuery.toLowerCase()),
        )
        .map((table: Table) => ({ ...table, zoneName: zone.name })),
    ) || [];

  const handlePrint = async (table: Table, event: any) => {
    event.stopPropagation();

    // For now, just show an alert
    // In a real implementation, you would get the latest KOT and print it
    Alert.alert('Print', `Print functionality for ${table.table_name}`);
  };

  const renderTable = (table: Table) => {
    const isActive = table.status === 'active';
    const tableWithKOT = table as any; // Cast to access KOT fields

    return (
      <TouchableOpacity
        key={table.id}
        style={[
          styles.tableCard,
          isActive ? styles.tableCardActive : styles.tableCardEmpty,
        ]}
        onPress={() => handleTablePress(table)}
      >
        <View style={styles.tableHeader}>
          <Ionicons
            name={isActive ? 'people' : 'people-outline'}
            size={24}
            color={isActive ? '#FFFFFF' : '#7C3AED'}
          />
          <View
            style={[
              styles.statusBadge,
              isActive ? styles.statusBadgeActive : styles.statusBadgeEmpty,
            ]}
          >
            <Text style={styles.statusText}>
              {isActive ? 'Active' : 'Empty'}
            </Text>
          </View>
        </View>

        <Text style={[styles.tableName, isActive && styles.tableNameActive]}>
          {table.table_name}
        </Text>
        <Text style={[styles.tableCode, isActive && styles.tableCodeActive]}>
          {table.table_code}
        </Text>

        {/* Active Table Info */}
        {isActive && tableWithKOT.active_since && (
          <View style={styles.activeInfo}>
            <View style={styles.activeInfoRow}>
              <Ionicons name="time-outline" size={14} color="#E9D5FF" />
              <TableTimer
                activeSince={tableWithKOT.active_since}
                style={styles.timerText}
              />
            </View>
            {tableWithKOT.current_total > 0 && (
              <View style={styles.activeInfoRow}>
                <Ionicons name="cash-outline" size={14} color="#E9D5FF" />
                <Text style={styles.totalText}>
                  ₹{tableWithKOT.current_total.toFixed(2)}
                </Text>
              </View>
            )}
            {tableWithKOT.total_kots > 0 && (
              <View style={styles.activeInfoRow}>
                <Ionicons name="receipt-outline" size={14} color="#E9D5FF" />
                <Text style={styles.kotCountText}>
                  {tableWithKOT.total_kots} KOT
                  {tableWithKOT.total_kots > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.tableFooter}>
          <View style={styles.capacityContainer}>
            <Ionicons
              name="person"
              size={16}
              color={isActive ? '#FFFFFF' : '#7C3AED'}
            />
            <Text style={[styles.capacity, isActive && styles.capacityActive]}>
              {table.capacity} seats
            </Text>
          </View>

          {/* Print Button for Active Tables */}
          {isActive && (
            <TouchableOpacity
              style={styles.printButton}
              onPress={e => handlePrint(table, e)}
            >
              <Ionicons name="print-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderZone = ({ item }: any) => (
    <View style={styles.zoneContainer}>
      <View style={styles.zoneHeader}>
        <Ionicons name="location" size={24} color="#7C3AED" />
        <Text style={styles.zoneName}>{item.name}</Text>
        <View style={styles.tableCount}>
          <Text style={styles.tableCountText}>{item.tables.length}</Text>
        </View>
      </View>

      <View style={styles.tablesGrid}>
        {item.tables.map((table: Table) => renderTable(table))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading tables...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.toggleDrawer()}
            >
              <Ionicons name="menu" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={32} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.businessName}>My Restaurant</Text>
              <Text style={styles.businessSubtitle}>Table Management</Text>
            </View>
          </View>
          <View style={styles.headerLeft}>{/* ... */}</View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RefreshButton
              onRefresh={async () => {
                await refetch();
              }}
              loading={isLoading}
              style={{
                marginRight: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowProfileMenu(!showProfileMenu)}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>
                  {currentUser?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Menu Dropdown */}
        {showProfileMenu && (
          <View style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              <Text style={styles.profileMenuName}>{currentUser?.name}</Text>
              <Text style={styles.profileMenuPhone}>{currentUser?.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.profileMenuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tables..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tables List */}
      <FlatList
        data={filteredZones || []}
        renderItem={renderZone}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No tables found</Text>
          </View>
        }
      />

      {/* Start Table Button */}
      <TouchableOpacity
        style={styles.startTableButtonContainer}
        onPress={() => setShowStartTableModal(true)}
      >
        <LinearGradient
          colors={['#7C3AED', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startTableButton}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.startTableButtonText}>Start Table</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Start Table Modal */}
      <Modal
        visible={showStartTableModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStartTableModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Empty Table</Text>
              <TouchableOpacity onPress={() => setShowStartTableModal(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Search */}
            <View style={styles.modalSearchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search empty tables..."
                placeholderTextColor="#9CA3AF"
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
              />
            </View>

            {/* Empty Tables List */}
            <ScrollView style={styles.modalTablesList}>
              {emptyTables.length === 0 ? (
                <View style={styles.modalEmptyState}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={64}
                    color="#D1D5DB"
                  />
                  <Text style={styles.modalEmptyStateText}>
                    {modalSearchQuery
                      ? 'No tables found'
                      : 'All tables are active'}
                  </Text>
                </View>
              ) : (
                emptyTables.map((table: any) => (
                  <TouchableOpacity
                    key={table.id}
                    style={styles.modalTableItem}
                    onPress={() => handleStartTable(table)}
                  >
                    <View style={styles.modalTableInfo}>
                      <Text style={styles.modalTableName}>
                        {table.table_name}
                      </Text>
                      <Text style={styles.modalTableZone}>
                        {table.zoneName} • {table.table_code}
                      </Text>
                    </View>
                    <View style={styles.modalTableCapacity}>
                      <Ionicons name="person" size={16} color="#7C3AED" />
                      <Text style={styles.modalTableCapacityText}>
                        {table.capacity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  businessSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  profileMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    minWidth: 200,
    zIndex: 1000,
  },
  profileMenuHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileMenuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  profileMenuPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileMenuItemText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  zoneContainer: {
    marginBottom: 24,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  zoneName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  tableCount: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tableCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  tableCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableCardEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tableCardActive: {
    backgroundColor: '#7C3AED',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeEmpty: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  tableNameActive: {
    color: '#FFFFFF',
  },
  tableCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  tableCodeActive: {
    color: '#E9D5FF',
  },
  activeInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  activeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E9D5FF',
    fontFamily: 'Ubuntu-Bold',
  },
  totalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Ubuntu-Bold',
  },
  kotCountText: {
    fontSize: 12,
    color: '#E9D5FF',
    fontFamily: 'Ubuntu-Regular',
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacity: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  capacityActive: {
    color: '#FFFFFF',
  },
  printButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  startTableButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  startTableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  startTableButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  modalTablesList: {
    paddingHorizontal: 24,
  },
  modalTableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalTableInfo: {
    flex: 1,
  },
  modalTableName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalTableZone: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalTableCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalTableCapacityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginLeft: 4,
  },
  modalEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  modalEmptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});

export default TablesScreen;
