import { create } from 'zustand';

export interface OrderNotification {
  id: string;
  title: string;
  body: string;
  tableName?: string;
  orderId?: string;
  receivedAt: number;
}

interface NotificationState {
  activeAlert: OrderNotification | null;
  unreadCount: number;
  lastOrderNotification: OrderNotification | null;

  showOrderAlert: (notification: OrderNotification) => void;
  hideActiveAlert: () => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  setLastOrder: (notification: OrderNotification) => void;
}

export const useNotificationStore = create<NotificationState>(set => ({
  activeAlert: null,
  unreadCount: 0,
  lastOrderNotification: null,

  showOrderAlert: notification =>
    set(state => ({
      activeAlert: notification,
      lastOrderNotification: notification,
      unreadCount: state.unreadCount + 1,
    })),

  hideActiveAlert: () => set({ activeAlert: null }),

  incrementUnread: () => set(state => ({ unreadCount: state.unreadCount + 1 })),

  clearUnread: () => set({ unreadCount: 0 }),

  setLastOrder: notification => set({ lastOrderNotification: notification }),
}));
