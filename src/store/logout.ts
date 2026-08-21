import useAuthStore from "./useAuthStore";
import useUserStore from "./useUserStore";

export function logout() {
  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
}
