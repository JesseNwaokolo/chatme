import useThemeStore from "./useThemeStore";

export function useTheme() {
  const { theme, mode, setMode } = useThemeStore();
  return { theme, mode, setMode };
}
