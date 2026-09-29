import { queryClient } from "@/src/api/queryClient";
import { queryPersister } from "@/src/api/queryPersister";
import { chatKeys } from "@/src/feature/chats/api/queryKeys";
import { toastConfig } from "@/src/shared/components/toastConfig";
import useAuthStore from "@/src/store/useAuthStore";
import { darkTheme } from "@/src/theme/colors";
import { fontAssets } from "@/src/theme/fonts";
import useThemeStore from "@/src/theme/useThemeStore";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] === chatKeys.all[0] && query.queryKey[1] === "list",
        },
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <StatusBar style={isDarkTheme ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}
