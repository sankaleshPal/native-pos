import { create } from 'zustand';

interface ModalState {
  // KOT Options Modal
  kotOptionsVisible: boolean;
  selectedKOTId: number | null;

  // Delete Item Modal
  deleteItemVisible: boolean;
  deleteStep: 1 | 2 | 3; // 1: Select items, 2: Password, 3: Reason
  selectedItemIds: number[];
  deletePassword: string;
  deleteReason: string;

  // Payment Mode Modal
  paymentModalVisible: boolean;
  selectedPaymentMode: 'UPI' | 'Cash' | 'Swiggy' | 'Zomato' | null;

  // Actions
  showKOTOptions: (kotId: number) => void;
  hideKOTOptions: () => void;

  showDeleteItem: () => void;
  hideDeleteItem: () => void;
  setDeleteStep: (step: 1 | 2 | 3) => void;
  toggleItemSelection: (itemId: number) => void;
  setDeletePassword: (password: string) => void;
  setDeleteReason: (reason: string) => void;
  resetDeleteModal: () => void;

  showPaymentModal: () => void;
  hidePaymentModal: () => void;
  setPaymentMode: (mode: 'UPI' | 'Cash' | 'Swiggy' | 'Zomato') => void;
  resetPaymentModal: () => void;
}

export const useModalStore = create<ModalState>()(set => ({
  // Initial state
  kotOptionsVisible: false,
  selectedKOTId: null,

  deleteItemVisible: false,
  deleteStep: 1,
  selectedItemIds: [],
  deletePassword: '',
  deleteReason: '',

  paymentModalVisible: false,
  selectedPaymentMode: null,

  // KOT Options actions
  showKOTOptions: kotId =>
    set({ kotOptionsVisible: true, selectedKOTId: kotId }),
  hideKOTOptions: () => set({ kotOptionsVisible: false, selectedKOTId: null }),

  // Delete Item actions
  showDeleteItem: () => set({ deleteItemVisible: true, deleteStep: 1 }),
  hideDeleteItem: () => set({ deleteItemVisible: false }),
  setDeleteStep: step => set({ deleteStep: step }),
  toggleItemSelection: itemId =>
    set(state => ({
      selectedItemIds: state.selectedItemIds.includes(itemId)
        ? state.selectedItemIds.filter(id => id !== itemId)
        : [...state.selectedItemIds, itemId],
    })),
  setDeletePassword: password => set({ deletePassword: password }),
  setDeleteReason: reason => set({ deleteReason: reason }),
  resetDeleteModal: () =>
    set({
      deleteItemVisible: false,
      deleteStep: 1,
      selectedItemIds: [],
      deletePassword: '',
      deleteReason: '',
    }),

  // Payment Modal actions
  showPaymentModal: () => set({ paymentModalVisible: true }),
  hidePaymentModal: () => set({ paymentModalVisible: false }),
  setPaymentMode: mode => set({ selectedPaymentMode: mode }),
  resetPaymentModal: () =>
    set({
      paymentModalVisible: false,
      selectedPaymentMode: null,
    }),
}));
