import { logoutRequest } from "../feature/auth/api/authApi";
import { unregisterFromPushNotifications } from "../shared/notifications/pushNotifications";
import useAuthStore from "./useAuthStore";
import useUserStore from "./useUserStore";

export async function logout() {
  const refreshToken = useAuthStore.getState().refreshToken;

  await unregisterFromPushNotifications();

  if (refreshToken) {
    try {
      await logoutRequest({ refreshToken });
    } catch {
    }
  }

  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
}
