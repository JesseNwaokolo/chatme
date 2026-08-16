import { darkTheme } from "@/src/theme/colors";
import { fontAssets } from "@/src/theme/fonts";
import useThemeStore from "@/src/theme/useThemeStore";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasThemeHydrated = useThemeStore((state) => state.hasHydrated);
  const theme = useThemeStore((state) => state.theme);
  const [fontsLoaded] = useFonts(fontAssets);
  const isDarkTheme = theme === darkTheme;

  useEffect(() => {
    if (fontsLoaded && hasThemeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasThemeHydrated]);

  if (!fontsLoaded || !hasThemeHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style={isDarkTheme ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
