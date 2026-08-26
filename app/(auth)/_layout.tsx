import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);

  if (status === "complete") {
    return <Redirect href="/(app)/(tabs)/chats" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
