import { create } from 'zustand';

// Dummy credentials
const VALID_MOBILE = '8668229890';
const VALID_PASSWORD = '2701';

interface AuthState {
  isAuthenticated: boolean;
  mobileNumber: string | null;
  loginTime: string | null;
  login: (mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  mobileNumber: null, loginTime: null,

  login: async (mobile: string, password: string): Promise<boolean> => {
    // Validate credentials
    if (mobile === VALID_MOBILE && password === VALID_PASSWORD) {
      set({
        isAuthenticated: true,
        mobileNumber: mobile,
        loginTime: new Date().toISOString(),
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      mobileNumber: null,
      loginTime: null,
    });
  },
}));
