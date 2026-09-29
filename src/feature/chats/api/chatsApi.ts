import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import { ConversationSettings } from "@/src/shared/types/conversation";
import useUserStore from "@/src/store/useUserStore";
import { Chat } from "../types";
import { ConversationListResponse, ConversationResponse } from "./types";

export interface ArchiveConversationResponse extends ConversationSettings {
  conversationId: string;
}

const toChat = (conversation: ConversationResponse): Chat => {
  const myUserId = useUserStore.getState().user?.id;
  const isGroup = conversation.type === "group";

  return {
    id: conversation.id,
    participantId: isGroup ? conversation.id : conversation.otherParticipant.id,
    name: isGroup ? conversation.name : (conversation.otherParticipant.displayName ?? "Unknown"),
    avatarUrl: isGroup ? conversation.avatarUrl : conversation.otherParticipant.avatarUrl,
    isGroup,
    lastMessage: conversation.latestMessage?.preview ?? "No messages yet",
    fromMe: conversation.latestMessage?.senderId === myUserId,
    timestamp: new Date(conversation.latestMessage?.createdAt ?? conversation.lastActivityAt),
    unreadCount: conversation.unreadCount,
    muted: conversation.settings?.muted,
    pinned: conversation.settings?.pinned,
    archived: conversation.settings?.archived,
  };
};

export const getConversations = () =>
  apiClient
    .get<ConversationListResponse>(endpoints.conversations.list)
    .then((res) => res.data.items.map(toChat))
    .catch((err) => {
      console.log("[chats] getConversations failed:", err);
      throw err;
    });

export const getArchivedConversations = (params: { cursor?: string; limit?: number } = {}) =>
  apiClient
    .get<ConversationListResponse>(endpoints.conversations.archivedList, { params })
    .then((res) => ({
      items: res.data.items.map(toChat),
      pageInfo: res.data.pageInfo,
    }));

export const getConversation = (conversationId: string) =>
  apiClient
    .get<ConversationResponse>(endpoints.conversations.detail(conversationId))
    .then((res) => res.data);

export const archiveConversation = (conversationId: string) =>
  apiClient
    .put<ArchiveConversationResponse>(endpoints.conversations.archive(conversationId))
    .then((res) => res.data);

export const unarchiveConversation = (conversationId: string) =>
  apiClient
    .delete<ArchiveConversationResponse>(endpoints.conversations.archive(conversationId))
    .then((res) => res.data);

export const pinConversation = (conversationId: string) =>
  apiClient
    .put<ArchiveConversationResponse>(endpoints.conversations.pin(conversationId))
    .then((res) => res.data);

export const unpinConversation = (conversationId: string) =>
  apiClient
    .delete<ArchiveConversationResponse>(endpoints.conversations.pin(conversationId))
    .then((res) => res.data);
