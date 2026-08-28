import { connectSocket, disconnectSocket } from "@/src/api/socket/socketClient";
import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

const AppLayout = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);

  useEffect(() => {
    if (!accessToken) return;
    connectSocket();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") connectSocket();
    });

    return () => {
      subscription.remove();
      disconnectSocket();
    };
  }, [accessToken]);

  if (status === "unauthenticated") {
    return <Redirect href="/(onboarding)" />;
  }
  if (status === "incomplete") {
    return <Redirect href="/(auth)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AppLayout;
