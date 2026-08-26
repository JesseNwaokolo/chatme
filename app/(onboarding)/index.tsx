import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import { OnboardingScreen } from "@/src/feature/onboarding/screens/OnboardingScreen";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { Redirect } from "expo-router";

export default function Onboarding() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);

  if (status === "complete") {
    return <Redirect href="/(app)/(tabs)/chats" />;
  }
  if (status === "incomplete") {
    return <Redirect href="/(auth)/enter-name" />;
  }

  return <OnboardingScreen />;
}
