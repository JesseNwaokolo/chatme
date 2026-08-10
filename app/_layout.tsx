import useThemeStore from "@/src/theme/useThemeStore";
import { Stack } from "expo-router";

export default function RootLayout() {
  const hasThemeHydrated = useThemeStore((state) => state.hasHydrated);
  return <Stack screenOptions={{ headerShown: false }} />;
}
