import { MessageCreatedEvent } from "@/src/api/socket/types";
import { connectSocket, disconnectSocket, getSocket } from "@/src/api/socket/socketClient";
import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import { markDelivered } from "@/src/feature/chats/api/messagesApi";
import { chatKeys } from "@/src/feature/chats/api/queryKeys";
import { Chat } from "@/src/feature/chats/types";
import { applyUnreadCount } from "@/src/feature/chats/utils/applyUnreadCount";
import { InAppNotificationBanner } from "@/src/shared/components/InAppNotificationBanner";
import { playNotificationSound } from "@/src/shared/utils/notificationSound";
import useActiveConversationStore from "@/src/store/useActiveConversationStore";
import useAuthStore from "@/src/store/useAuthStore";
import useMutedChatsStore from "@/src/store/useMutedChatsStore";
import useNotificationBannerStore from "@/src/store/useNotificationBannerStore";
import useSocketStore from "@/src/store/useSocketStore";
import useUserStore from "@/src/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

const AppLayout = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);
  const isSocketConnected = useSocketStore((s) => s.isConnected);
  const queryClient = useQueryClient();

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

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessageCreated = (payload: MessageCreatedEvent) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });

      const myUserId = useUserStore.getState().user?.id;
      if (payload.senderId === myUserId) return;

      markDelivered(payload.conversationId, payload.id)
        .then((data) => applyUnreadCount(queryClient, data.conversationId, data.unreadCount))
        .catch(() => {});

      const activeConversationId = useActiveConversationStore.getState().activeConversationId;
      if (activeConversationId === payload.conversationId) return;
      if (AppState.currentState !== "active") return;

      const chats = queryClient.getQueryData<Chat[]>(chatKeys.list());
      const chat = chats?.find((c) => c.id === payload.conversationId);
      if (!chat) return;
      if (chat.muted || useMutedChatsStore.getState().isMuted(chat.id)) return;

      playNotificationSound();

      useNotificationBannerStore.getState().show({
        id: payload.id,
        conversationId: payload.conversationId,
        participantId: chat.participantId,
        name: chat.name,
        avatarUrl: chat.avatarUrl,
        isGroup: chat.isGroup,
        text:
          payload.text ||
          {
            image: "📷 Photo",
            video: "🎥 Video",
            audio: "🎤 Voice message",
            document: "📄 Document",
            text: "",
          }[payload.kind],
      });
    };

    socket.on("message.created", handleMessageCreated);
    return () => {
      socket.off("message.created", handleMessageCreated);
    };
  }, [isSocketConnected, queryClient]);

  if (status === "unauthenticated") {
    return <Redirect href="/(onboarding)" />;
  }
  if (status === "incomplete") {
    return <Redirect href="/(auth)" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <InAppNotificationBanner />
    </>
  );
};

export default AppLayout;
