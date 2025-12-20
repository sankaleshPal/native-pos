import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authenticateUser } from '../db/services/userService';
import {
  getAllTablesWithZones,
  updateTableStatus as updateTableStatusService,
} from '../db/services/zoneService';
import type { User, ZoneWithTables } from '../db/types';

// Query keys
export const queryKeys = {
  tablesWithZones: ['tables', 'zones'] as const,
  users: ['users'] as const,
  kots: (tableId: number) => ['kots', tableId] as const,
  bill: (tableId: number) => ['bill', tableId] as const,
  allBills: ['bills'] as const,
  dashboardStats: ['dashboard'] as const,
};
// ... existing code ...

export const useTablesWithZones = () => {
  return useQuery({
    queryKey: queryKeys.tablesWithZones,
    queryFn: getAllTablesWithZones,
    staleTime: 0,
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableId,
      status,
    }: {
      tableId: number;
      status: 'empty' | 'active';
    }) => {
      await updateTableStatusService(tableId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tablesWithZones });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
};

// ... existing code ...

import {
  createKOT,
  deleteKOTItem,
  markTableActive,
} from '../db/services/kotService';
import type { CartItem, PaymentMode } from '../db/types';

export const useCreateKOT = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableId,
      userId,
      punchedBy,
      cartItems,
    }: {
      tableId: number;
      userId: string;
      punchedBy: string;
      cartItems: CartItem[];
    }) => {
      // Create KOT
      await createKOT(tableId, userId, punchedBy, cartItems);
      // Ensure table is active
      await markTableActive(tableId);
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tablesWithZones });
      queryClient.invalidateQueries({ queryKey: queryKeys.kots(tableId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
};

export const useDeleteKOTItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      reason,
      deletedBy,
      password,
      tableId, // Need tableId for invalidation
    }: {
      itemId: number;
      reason: string;
      deletedBy: string;
      password: string;
      tableId: number;
    }) => {
      await deleteKOTItem(itemId, deletedBy, reason, password);
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tablesWithZones }); // Update totals
      queryClient.invalidateQueries({ queryKey: queryKeys.kots(tableId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
};

// --- Bill Mutations ---

import {
  createBill,
  getBillByTable,
  settleBill,
} from '../db/services/billService';

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tableId: number) => {
      await createBill(tableId);
    },
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bill(tableId) });
    },
  });
};

export const useSettleBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      billId,
      paymentMode,
      settledBy,
      tableId,
    }: {
      billId: number;
      paymentMode: PaymentMode;
      settledBy: string;
      tableId: number;
    }) => {
      await settleBill(billId, paymentMode, settledBy);
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tablesWithZones }); // Table becomes empty
      queryClient.invalidateQueries({ queryKey: queryKeys.bill(tableId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.kots(tableId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allBills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
};

// --- Queries ---

import { getKOTsByTable } from '../db/services/kotService';

export const useKOTs = (tableId: number) => {
  return useQuery({
    queryKey: queryKeys.kots(tableId),
    queryFn: () => getKOTsByTable(tableId),
    enabled: !!tableId,
    staleTime: 0, // Always fetch fresh
  });
};

export const useBill = (tableId: number) => {
  return useQuery({
    queryKey: queryKeys.bill(tableId),
    queryFn: () => getBillByTable(tableId),
    enabled: !!tableId,
    staleTime: 0,
  });
};
