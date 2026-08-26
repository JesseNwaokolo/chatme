import { logoutRequest } from "../feature/auth/api/authApi";
import useAuthStore from "./useAuthStore";
import useUserStore from "./useUserStore";

export async function logout() {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (refreshToken) {
    try {
      await logoutRequest({ refreshToken });
    } catch {
      // still clear the local session even if the server call fails
    }
  }

  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
}
