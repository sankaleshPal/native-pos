import { create } from 'zustand';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'NEW' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
}

export interface Table {
  id: string;
  number: number;
  status: 'IDLE' | 'ACTIVE';
}

interface OrderState {
  orders: Order[];
  tables: Table[];
  activeAlert: Order | null;

  // Actions
  addOrder: (order: Order) => void;
  acceptOrder: (orderId: string) => void;
  dismissAlert: () => void;
  initTables: (count?: number) => void;
}

export const useOrderStore = create<OrderState>(set => ({
  orders: [],
  tables: Array.from({ length: 20 }, (_, i) => ({
    id: `T${i + 1}`,
    number: i + 1,
    status: 'IDLE',
  })),
  activeAlert: null,

  initTables: (count = 20) => {
    set({
      tables: Array.from({ length: count }, (_, i) => ({
        id: `T${i + 1}`,
        number: i + 1,
        status: 'IDLE',
      })),
    });
  },

  addOrder: order =>
    set(state => {
      // Basic validation: Check if table is already active?
      // Requirement says "Random idle table", so the generator should handle that.
      // But if a manual order came in for an active table, we might append or reject.
      // For now, we trust the generator.

      return {
        orders: [order, ...state.orders],
        activeAlert: order, // The latest order triggers the alert
      };
    }),

  acceptOrder: orderId =>
    set(state => {
      const orderToAccept = state.orders.find(o => o.id === orderId);
      if (!orderToAccept) return {};

      // Mark order as ACCEPTED
      const updatedOrders = state.orders.map(o =>
        o.id === orderId ? { ...o, status: 'ACCEPTED' as const } : o,
      );

      // Update Table status to ACTIVE
      const updatedTables = state.tables.map(t =>
        t.id === orderToAccept.tableId
          ? { ...t, status: 'ACTIVE' as const }
          : t,
      );

      // If the accepted order was the active alert, dismiss it (though usually alert is tapped first)
      const updatedAlert =
        state.activeAlert?.id === orderId ? null : state.activeAlert;

      return {
        orders: updatedOrders,
        tables: updatedTables,
        activeAlert: updatedAlert,
      };
    }),

  dismissAlert: () => set({ activeAlert: null }),
}));
