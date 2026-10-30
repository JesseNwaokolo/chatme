import { ApiError } from "@/src/api/errors";
import { getConversation } from "@/src/feature/chats/api/chatsApi";
import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import useActiveConversationStore from "@/src/store/useActiveConversationStore";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import * as Notifications from "expo-notifications";
import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import { createNotificationCoordinator } from "./notificationRouting";

// Mounted once at the root so a tap is captured even while signed out, then acted on when
// the app is ready. Renders nothing.
export const NotificationRouter = () => {
  const router = useRouter();
  const navigationReady = !!useRootNavigationState()?.key;
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);
  const ready = navigationReady && status === "complete";
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const routerRef = useRef(router);
  routerRef.current = router;

  const coordinator = useRef(
    createNotificationCoordinator({
      getState: () => ({ ready: readyRef.current, userId: useUserStore.getState().user?.id ?? null }),
      checkConversation: (conversationId) =>
        getConversation(conversationId).then(
          () => "ok" as const,
          (error) =>
            error instanceof ApiError && (error.status === 404 || error.status === 403)
              ? ("unavailable" as const)
              : ("unknown" as const),
        ),
      openConversation: (conversationId) => {
        if (useActiveConversationStore.getState().activeConversationId === conversationId) return;
        routerRef.current.push({ pathname: "/conversation/[id]", params: { id: conversationId } });
      },
      showUnavailable: () => {
        Toast.show({ type: "error", text1: "That conversation isn't available" });
        routerRef.current.navigate("/(app)/(tabs)/chats");
      },
    }),
  ).current;

  useEffect(() => {
    const handle = (response: Notifications.NotificationResponse) =>
      coordinator.receive(response.notification.request.identifier, response.notification.request.content.data);

    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    Notifications.getLastNotificationResponseAsync()
      .then((response) => response && handle(response))
      .catch(() => {});
    return () => subscription.remove();
  }, [coordinator]);

  useEffect(() => {
    void coordinator.process();
  }, [coordinator, ready, user?.id]);

  return null;
};
