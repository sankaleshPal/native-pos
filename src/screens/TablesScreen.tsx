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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePOSStore } from '../store/posStore';
import { useThemeStore } from '../store/themeStore';
import { useTablesWithZones, useUpdateTableStatus } from '../hooks/useDatabase';
import TableTimer from '../components/TableTimer';
import type { Table, ZoneWithTables } from '../db/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RefreshButton from '../components/RefreshButton';
import LinearGradient from 'react-native-linear-gradient';

const TablesScreen = () => {
  const navigation = useNavigation<any>();
  const { data: zonesWithTables, isLoading, refetch } = useTablesWithZones();
  const { logout, currentUser } = usePOSStore();
  const { theme, isDarkMode } = useThemeStore();

  const styles = getStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStartTableModal, setShowStartTableModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'POSLogin' }],
    });
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
          <View
            style={[
              styles.iconBox,
              isActive ? { backgroundColor: 'rgba(255,255,255,0.2)' } : {},
            ]}
          >
            <Ionicons
              name={isActive ? 'people' : 'people-outline'}
              size={20}
              color={isActive ? '#FFFFFF' : theme.colors.primary}
            />
          </View>

          <View
            style={[
              styles.statusBadge,
              isActive ? styles.statusBadgeActive : styles.statusBadgeEmpty,
            ]}
          >
            <Text
              style={[styles.statusText, isActive ? { color: '#FFF' } : {}]}
            >
              {isActive ? 'Active' : 'Empty'}
            </Text>
          </View>
        </View>

        <Text style={[styles.tableName, isActive && styles.tableNameActive]}>
          {table.table_name}
        </Text>
        {isActive && (
          <Text style={styles.tableCodeActive}>{table.table_code}</Text>
        )}

        {/* Active Table Info */}
        {isActive && tableWithKOT.active_since && (
          <View style={styles.activeInfo}>
            <View style={styles.activeInfoRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color="rgba(255,255,255,0.8)"
              />
              <TableTimer
                activeSince={tableWithKOT.active_since}
                style={styles.timerText}
              />
            </View>
            {tableWithKOT.current_total > 0 && (
              <View style={styles.activeInfoRow}>
                <Ionicons
                  name="cash-outline"
                  size={14}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.totalText}>
                  ₹{tableWithKOT.current_total.toFixed(2)}
                </Text>
              </View>
            )}
            {tableWithKOT.total_kots > 0 && (
              <View style={styles.activeInfoRow}>
                <Ionicons
                  name="receipt-outline"
                  size={14}
                  color="rgba(255,255,255,0.8)"
                />
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
              size={14}
              color={
                isActive ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary
              }
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
              <Ionicons name="print-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderZone = ({ item }: any) => (
    <View style={styles.zoneContainer}>
      <View style={styles.zoneHeader}>
        <Ionicons
          name="location-sharp"
          size={20}
          color={theme.colors.primary}
        />
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading tables...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.toggleDrawer()}
            >
              <Ionicons
                name="menu"
                size={28}
                color={theme.colors.primaryForeground}
              />
            </TouchableOpacity>

            <View>
              <Text style={styles.businessName}>My Restaurant</Text>
              <Text style={styles.businessSubtitle}>Dashboard</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <RefreshButton
              onRefresh={async () => {
                await refetch();
              }}
              loading={isLoading}
              style={{
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
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.colors.error}
              />
              <Text style={styles.profileMenuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tables..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
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
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No tables found</Text>
          </View>
        }
      />

      {/* Start Table Button */}
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={() => setShowStartTableModal(true)}
      >
        <View style={styles.fab}>
          <Ionicons
            name="add"
            size={32}
            color={theme.colors.primaryForeground}
          />
        </View>
      </TouchableOpacity>

      {/* Start Table Modal */}
      <Modal
        visible={showStartTableModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStartTableModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStartTableModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Empty Table</Text>
              <TouchableOpacity onPress={() => setShowStartTableModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search empty tables..."
                placeholderTextColor={theme.colors.textSecondary}
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
              />
            </View>

            <ScrollView style={styles.modalTablesList}>
              {emptyTables.length === 0 ? (
                <View style={styles.modalEmptyState}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={64}
                    color={theme.colors.textSecondary}
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
                      <Ionicons
                        name="person"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.modalTableCapacityText}>
                        {table.capacity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 48, // Increased for status bar
      paddingBottom: 24,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      ...theme.shadows.card,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuButton: {
      marginRight: 16,
    },
    businessName: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primaryForeground,
    },
    businessSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    profileButton: {
      padding: 2,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
      borderRadius: 24,
    },
    profileAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInitial: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    profileMenu: {
      position: 'absolute',
      top: 70,
      right: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 8,
      ...theme.shadows.card,
      minWidth: 200,
      zIndex: 1000,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    profileMenuHeader: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    profileMenuName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    profileMenuPhone: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    profileMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    profileMenuItemText: {
      fontSize: 16,
      color: theme.colors.error,
      marginLeft: 12,
      fontWeight: '500',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      height: '100%',
    },
    listContent: {
      padding: 20,
      paddingBottom: 100,
    },
    zoneContainer: {
      marginBottom: 24,
    },
    zoneHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    zoneName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 8,
      flex: 1,
    },
    tableCount: {
      backgroundColor: theme.colors.surfaceHighlight,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tableCountText: {
      color: theme.colors.primary,
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
      ...theme.shadows.card,
      minHeight: 140,
      justifyContent: 'space-between',
    },
    tableCardEmpty: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tableCardActive: {
      backgroundColor: theme.colors.primary,
    },
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusBadgeEmpty: {
      backgroundColor: theme.colors.surfaceHighlight,
    },
    statusBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
    },
    tableName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    tableNameActive: {
      color: '#FFFFFF',
    },
    tableCode: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    tableCodeActive: {
      color: 'rgba(255,255,255,0.7)',
    },
    activeInfo: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
      gap: 4,
    },
    activeInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timerText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    totalText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    kotCountText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
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
      gap: 4,
    },
    capacity: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    capacityActive: {
      color: 'rgba(255,255,255,0.8)',
    },
    printButton: {
      padding: 6,
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
      color: theme.colors.textSecondary,
      marginTop: 16,
    },
    fabContainer: {
      position: 'absolute',
      bottom: 24,
      right: 24,
    },
    fab: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    modalSearchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 52,
      marginHorizontal: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    modalTablesList: {
      paddingHorizontal: 24,
    },
    modalTableItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.card,
    },
    modalTableInfo: {
      flex: 1,
    },
    modalTableName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    modalTableZone: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    modalTableCapacity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.surfaceHighlight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    modalTableCapacityText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    modalEmptyState: {
      padding: 32,
      alignItems: 'center',
    },
    modalEmptyStateText: {
      marginTop: 16,
      color: theme.colors.textSecondary,
      fontSize: 16,
    },
  });

export default TablesScreen;
