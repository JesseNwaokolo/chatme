import { fontAssets } from "@/src/theme/fonts";
import useThemeStore from "@/src/theme/useThemeStore";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasThemeHydrated = useThemeStore((state) => state.hasHydrated);
  const [fontsLoaded] = useFonts(fontAssets);

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
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
