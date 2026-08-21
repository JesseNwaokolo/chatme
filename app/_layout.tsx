import { queryClient } from "@/src/api/queryClient";
import { toastConfig } from "@/src/shared/components/toastConfig";
import useAuthStore from "@/src/store/useAuthStore";
import { darkTheme } from "@/src/theme/colors";
import { fontAssets } from "@/src/theme/fonts";
import useThemeStore from "@/src/theme/useThemeStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasThemeHydrated = useThemeStore((state) => state.hasHydrated);
  const theme = useThemeStore((state) => state.theme);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const [fontsLoaded] = useFonts(fontAssets);
  const isDarkTheme = theme === darkTheme;

  useEffect(() => {
    if (fontsLoaded && hasThemeHydrated && hasAuthHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasThemeHydrated, hasAuthHydrated]);

  if (!fontsLoaded || !hasThemeHydrated || !hasAuthHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <StatusBar style={isDarkTheme ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
