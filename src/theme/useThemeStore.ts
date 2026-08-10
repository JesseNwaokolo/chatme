import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { darkTheme, lightTheme } from "./colors";

type Mode = "light" | "dark" | "system";
export type Theme = typeof lightTheme | typeof darkTheme;

interface ThemeStore {
  theme: Theme;
  mode: Mode;
  setMode: (mode: Mode) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

function resolveTheme(mode: Mode) {
  const theme = mode === "system" ? Appearance.getColorScheme() : mode;
  return theme === "dark" ? darkTheme : lightTheme;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: resolveTheme("system"),
      mode: "system",
      setMode: (mode: Mode) => {
        set({ mode, theme: resolveTheme(mode) });
      },
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.theme = resolveTheme(state.mode);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

Appearance.addChangeListener(() => {
  const mode = useThemeStore.getState().mode;
  if (mode === "system") {
    useThemeStore.setState({ theme: resolveTheme("system") });
  }
});

export default useThemeStore;
