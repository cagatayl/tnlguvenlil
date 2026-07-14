import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authenticate, hasPermission } from '@/lib/auth';
import type { User, Permission } from '@/lib/auth';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  displayName: string;
  action: string;
  page: string;
  timestamp: string;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginError: string | null;
  userLocation: LocationData | null;
  userLocationsMap?: Record<string, LocationData>;
  activityLogs: ActivityLog[];

  login: (username: string, password: string) => boolean;
  logout: () => void;
  clearError: () => void;
  setLocation: (loc: LocationData) => void;
  logActivity: (action: string, page: string) => void;
  can: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      loginError: null,
      userLocation: null,
      userLocationsMap: {},
      activityLogs: [],

      login: (username: string, password: string) => {
        const user = authenticate(username, password);
        if (user) {
          set({ currentUser: user, isAuthenticated: true, loginError: null });
          // Log the login
          const log: ActivityLog = {
            id: Date.now().toString(),
            userId: user.id,
            displayName: user.displayName,
            action: 'Sisteme giriş yaptı',
            page: 'Login',
            timestamp: new Date().toISOString(),
          };
          set(state => ({ activityLogs: [log, ...state.activityLogs].slice(0, 200) }));
          return true;
        } else {
          set({ loginError: 'Kullanıcı adı veya şifre hatalı!' });
          return false;
        }
      },

      logout: () => {
        const user = get().currentUser;
        if (user) {
          const log: ActivityLog = {
            id: Date.now().toString(),
            userId: user.id,
            displayName: user.displayName,
            action: 'Sistemden çıkış yaptı',
            page: 'Logout',
            timestamp: new Date().toISOString(),
          };
          set(state => ({ activityLogs: [log, ...state.activityLogs].slice(0, 200) }));
        }
        set({ currentUser: null, isAuthenticated: false, loginError: null });
      },

      clearError: () => set({ loginError: null }),

      setLocation: (loc: LocationData) => {
        const user = get().currentUser;
        set((state) => ({
          userLocation: loc,
          userLocationsMap: {
            ...state.userLocationsMap,
            [user?.id || 'unknown']: loc,
            [user?.displayName || 'unknown']: loc,
          }
        }));
      },

      logActivity: (action: string, page: string) => {
        const user = get().currentUser;
        if (!user) return;
        const log: ActivityLog = {
          id: Date.now().toString() + Math.random(),
          userId: user.id,
          displayName: user.displayName,
          action,
          page,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          activityLogs: [log, ...state.activityLogs].slice(0, 200),
        }));
      },

      can: (permission: Permission) => {
        const user = get().currentUser;
        if (!user) return false;
        return hasPermission(user.role, permission);
      },
    }),
    {
      name: 'TNL_AUTH_SESSION',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        activityLogs: state.activityLogs,
        userLocation: state.userLocation,
      }),
    }
  )
);
