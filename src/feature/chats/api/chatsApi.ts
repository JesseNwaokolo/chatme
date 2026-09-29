import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import { ConversationSettings } from "@/src/shared/types/conversation";
import useUserStore from "@/src/store/useUserStore";
import { Chat } from "../types";
import {
  ConversationListResponse,
  ConversationResponse,
  ConversationSettingsResponse,
  DeleteDirectChatResponse,
  GroupMemberRole,
  MuteDuration,
} from "./types";

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

export const createGroupConversation = (body: { name: string; participantIds: string[] }) =>
  apiClient
    .post<ConversationResponse>(endpoints.conversations.createGroup, body)
    .then((res) => res.data);

export const updateGroupConversation = (
  conversationId: string,
  body: { name?: string; avatarMediaId?: string | null },
) =>
  apiClient
    .patch<ConversationResponse>(endpoints.conversations.detail(conversationId), body)
    .then((res) => res.data);

export const deleteGroup = (conversationId: string) =>
  apiClient.delete<void>(endpoints.conversations.detail(conversationId)).then(() => undefined);

export const setGroupAvatar = (conversationId: string, mediaId: string) =>
  apiClient
    .put<ConversationResponse>(endpoints.conversations.avatar(conversationId), { mediaId })
    .then((res) => res.data);

export const removeGroupAvatar = (conversationId: string) =>
  apiClient
    .delete<ConversationResponse>(endpoints.conversations.avatar(conversationId))
    .then((res) => res.data);

export const addGroupMembers = (conversationId: string, participantIds: string[]) =>
  apiClient
    .post<ConversationResponse>(endpoints.conversations.members(conversationId), {
      participantIds,
    })
    .then((res) => res.data);

export const removeGroupMember = (conversationId: string, memberId: string) =>
  apiClient
    .delete<void>(endpoints.conversations.member(conversationId, memberId))
    .then(() => undefined);

export const updateGroupMemberRole = (
  conversationId: string,
  memberId: string,
  role: GroupMemberRole,
) =>
  apiClient
    .patch<ConversationResponse>(endpoints.conversations.memberRole(conversationId, memberId), {
      role,
    })
    .then((res) => res.data);

export const transferGroupOwnership = (conversationId: string, newOwnerId: string) =>
  apiClient
    .post<ConversationResponse>(endpoints.conversations.transferOwnership(conversationId), {
      newOwnerId,
    })
    .then((res) => res.data);

export const leaveGroup = (conversationId: string) =>
  apiClient.post<void>(endpoints.conversations.leave(conversationId)).then(() => undefined);

export const deleteDirectChatForMe = (conversationId: string) =>
  apiClient
    .delete<DeleteDirectChatResponse>(endpoints.conversations.deleteForMe(conversationId))
    .then((res) => res.data);

export const getFavoriteConversations = (
  params: { cursor?: string; limit?: number; archived?: boolean } = {},
) =>
  apiClient
    .get<ConversationListResponse>(endpoints.conversations.favorites, { params })
    .then((res) => ({ items: res.data.items.map(toChat), pageInfo: res.data.pageInfo }));

export const favoriteConversation = (conversationId: string) =>
  apiClient
    .put<ConversationSettingsResponse>(endpoints.conversations.favorite(conversationId))
    .then((res) => res.data);

export const unfavoriteConversation = (conversationId: string) =>
  apiClient
    .delete<ConversationSettingsResponse>(endpoints.conversations.favorite(conversationId))
    .then((res) => res.data);

export const updateConversationSettings = (
  conversationId: string,
  body: { archived?: boolean; muted?: boolean; pinned?: boolean },
) =>
  apiClient
    .patch<ConversationSettingsResponse>(endpoints.conversations.settings(conversationId), body)
    .then((res) => res.data);

export const muteConversation = (conversationId: string, duration: MuteDuration) =>
  apiClient
    .put<ConversationSettingsResponse>(endpoints.conversations.mute(conversationId), { duration })
    .then((res) => res.data);

export const unmuteConversation = (conversationId: string) =>
  apiClient
    .delete<ConversationSettingsResponse>(endpoints.conversations.mute(conversationId))
    .then((res) => res.data);
