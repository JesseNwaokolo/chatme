import { endedSessionConfig } from "../api/client";
import { clearPersistedCache } from "../api/queryPersister";
import { logoutRequest } from "../feature/auth/api/authApi";
import { unregisterFromPushNotifications } from "../shared/notifications/pushNotifications";
import useAuthStore from "./useAuthStore";
import useDraftStore from "./useDraftStore";
import useOutboxStore from "./useOutboxStore";
import useUserStore from "./useUserStore";

// Local sign-out is immediate and never waits on the network. Remote cleanup is
// best-effort, bounded by a short timeout, and runs with the ended session's own
// credentials. Failure means the server-side session may still be alive; callers
// must not treat a resolved logout() as confirmed revocation.
export function logout() {
  const { accessToken, refreshToken, sessionId } = useAuthStore.getState();

  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
  useDraftStore.getState().clearAll();
  useOutboxStore.getState().clearAll();
  clearPersistedCache();

  const config = endedSessionConfig({ accessToken, sessionId });
  const cleanup = Promise.allSettled([
    unregisterFromPushNotifications(config),
    refreshToken ? logoutRequest({ refreshToken }, config) : Promise.resolve(),
  ]);
  return cleanup.then(([, revoke]) => ({ remoteRevoked: revoke.status === "fulfilled" }));
}
