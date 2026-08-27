import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { darkTheme, lightTheme } from "./colors";

type Mode = "light" | "dark" | "system";
export type Theme = typeof lightTheme | typeof darkTheme;

const DEFAULT_ACCENT_COLOR = lightTheme.buttonPrimary;

interface ThemeStore {
  theme: Theme;
  mode: Mode;
  setMode: (mode: Mode) => void;
  accentColor: string;
  setAccentColor: (accentColor: string) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

function resolveTheme(mode: Mode, accentColor: string): Theme {
  const resolvedMode = mode === "system" ? Appearance.getColorScheme() : mode;
  const base = resolvedMode === "dark" ? darkTheme : lightTheme;
  return { ...base, buttonPrimary: accentColor };
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: resolveTheme("light", DEFAULT_ACCENT_COLOR),
      mode: "light",
      setMode: (mode: Mode) => {
        set({ mode, theme: resolveTheme(mode, get().accentColor) });
      },
      accentColor: DEFAULT_ACCENT_COLOR,
      setAccentColor: (accentColor: string) => {
        set({ accentColor, theme: resolveTheme(get().mode, accentColor) });
      },
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode, accentColor: state.accentColor }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.theme = resolveTheme(state.mode, state.accentColor);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

Appearance.addChangeListener(() => {
  const { mode, accentColor } = useThemeStore.getState();
  if (mode === "system") {
    useThemeStore.setState({ theme: resolveTheme("system", accentColor) });
  }
});

export default useThemeStore;
