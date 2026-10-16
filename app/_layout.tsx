import { API_BASE_URL } from "@/src/api/config";
import { queryClient } from "@/src/api/queryClient";
import { queryPersister } from "@/src/api/queryPersister";
import { chatKeys } from "@/src/feature/chats/api/queryKeys";
import { toastConfig } from "@/src/shared/components/toastConfig";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { darkTheme } from "@/src/theme/colors";
import { fontAssets } from "@/src/theme/fonts";
import useThemeStore from "@/src/theme/useThemeStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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

const PERSISTED_CHAT_QUERIES = new Set(["list", "archived", "messages", "receipts", "detail"]);

export default function RootLayout() {
  const hasThemeHydrated = useThemeStore((state) => state.hasHydrated);
  const theme = useThemeStore((state) => state.theme);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const userId = useUserStore((state) => state.user?.id);
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
        maxAge: 7 * 24 * 60 * 60 * 1000,
        buster: `${API_BASE_URL}|${userId ?? ""}`,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            query.queryKey[0] === chatKeys.all[0] &&
            PERSISTED_CHAT_QUERIES.has(String(query.queryKey[1])) &&
            !query.queryKey.includes("search"),
        },
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <StatusBar style={isDarkTheme ? "light" : "dark"} />
              <Stack screenOptions={{ headerShown: false }} />
            </BottomSheetModalProvider>
            <Toast config={toastConfig} />
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}
