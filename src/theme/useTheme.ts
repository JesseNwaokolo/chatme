import useThemeStore from "./useThemeStore";

export function useTheme() {
  const { theme, mode, setMode, accentColor, setAccentColor } = useThemeStore();
  return { theme, mode, setMode, accentColor, setAccentColor };
}
