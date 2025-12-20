import { create } from 'zustand';
import type { User, ZoneWithTables } from '../db/types';
import { authenticateUser } from '../db/services/userService';
import {
  getAllTablesWithZones,
  updateTableStatus,
} from '../db/services/zoneService';

interface POSState {
  isAuthenticated: boolean;
  currentUser: User | null;
  zonesWithTables: ZoneWithTables[];
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadTablesData: () => Promise<void>;
  updateTableStatus: (
    tableId: number,
    status: 'empty' | 'active',
  ) => Promise<void>;
}

export const usePOSStore = create<POSState>()((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  zonesWithTables: [],

  login: async (phone: string, password: string): Promise<boolean> => {
    try {
      const user = await authenticateUser(phone, password);

      if (user) {
        set({
          isAuthenticated: true,
          currentUser: user,
        });
        await get().loadTablesData();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
      zonesWithTables: [],
    });
  },

  loadTablesData: async () => {
    try {
      const data = await getAllTablesWithZones();
      set({ zonesWithTables: data });
    } catch (error) {
      console.error('Error loading tables data:', error);
    }
  },

  updateTableStatus: async (tableId: number, status: 'empty' | 'active') => {
    try {
      await updateTableStatus(tableId, status);
      await get().loadTablesData(); // Refresh data
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  },
}));
