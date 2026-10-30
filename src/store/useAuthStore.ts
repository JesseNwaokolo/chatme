import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./storage/secureStorage";

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: number;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  rotateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      sessionId: 0,
      // A new login starts a new session; anything still in flight for the old one is stale.
      setTokens: ({ accessToken, refreshToken }) =>
        set((s) => ({ accessToken, refreshToken, sessionId: s.sessionId + 1 })),
      // Refresh keeps the same session, only the credentials change.
      rotateTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      clearTokens: () =>
        set((s) => ({ accessToken: null, refreshToken: null, sessionId: s.sessionId + 1 })),
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: ({ accessToken, refreshToken }) => ({ accessToken, refreshToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
