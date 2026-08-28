import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import useUserStore from "@/src/store/useUserStore";
import { Chat } from "../types";
import { ConversationListResponse, ConversationResponse } from "./types";

const toChat = (conversation: ConversationResponse): Chat => {
  const myUserId = useUserStore.getState().user?.id;

  return {
    id: conversation.id,
    name: conversation.otherParticipant.displayName ?? "Unknown",
    avatarUrl: conversation.otherParticipant.avatarUrl,
    lastMessage: conversation.latestMessage?.preview ?? "No messages yet",
    fromMe: conversation.latestMessage?.senderId === myUserId,
    timestamp: new Date(conversation.latestMessage?.createdAt ?? conversation.lastActivityAt),
    unreadCount: conversation.unreadCount,
  };
};

export const getConversations = () =>
  apiClient
    .get<ConversationListResponse>(endpoints.conversations.list)
    .then((res) => res.data.items.map(toChat));
