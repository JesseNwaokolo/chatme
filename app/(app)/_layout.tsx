import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { Redirect, Stack } from "expo-router";

const AppLayout = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);

  if (status === "unauthenticated") {
    return <Redirect href="/(onboarding)" />;
  }
  if (status === "incomplete") {
    return <Redirect href="/(auth)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AppLayout;
