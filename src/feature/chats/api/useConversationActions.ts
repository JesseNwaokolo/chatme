import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGroupMembers,
  deleteDirectChatForMe,
  deleteGroup,
  favoriteConversation,
  leaveGroup,
  muteConversation,
  removeGroupAvatar,
  removeGroupMember,
  setGroupAvatar,
  transferGroupOwnership,
  unfavoriteConversation,
  unmuteConversation,
  updateConversationSettings,
  updateGroupConversation,
  updateGroupMemberRole,
} from "./chatsApi";
import { clearConversationMessages, markAllRead } from "./messagesApi";
import { chatKeys } from "./queryKeys";
import { GroupMemberRole, MuteDuration } from "./types";

function useInvalidateChats(conversationId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    queryClient.invalidateQueries({ queryKey: chatKeys.archived() });
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(conversationId) });
    }
  };
}

export function useMuteConversation(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (duration: MuteDuration) => muteConversation(conversationId, duration),
    onSuccess: invalidate,
  });
}

export function useUnmuteConversation(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: () => unmuteConversation(conversationId),
    onSuccess: invalidate,
  });
}

export function useFavoriteConversation(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (favorite: boolean) =>
      favorite ? favoriteConversation(conversationId) : unfavoriteConversation(conversationId),
    onSuccess: invalidate,
  });
}

export function useUpdateConversationSettings(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (body: { archived?: boolean; muted?: boolean; pinned?: boolean }) =>
      updateConversationSettings(conversationId, body),
    onSuccess: invalidate,
  });
}

export function useClearConversation(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: () => clearConversationMessages(conversationId),
    onSuccess: invalidate,
  });
}

export function useMarkAllRead(conversationId: string) {
  const invalidate = useInvalidateChats();
  return useMutation({
    mutationFn: () => markAllRead(conversationId),
    onSuccess: invalidate,
  });
}

export function useDeleteDirectChat(conversationId: string) {
  const invalidate = useInvalidateChats();
  return useMutation({
    mutationFn: () => deleteDirectChatForMe(conversationId),
    onSuccess: invalidate,
  });
}

export function useRenameGroup(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (name: string) => updateGroupConversation(conversationId, { name }),
    onSuccess: invalidate,
  });
}

export function useSetGroupAvatar(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (mediaId: string) => setGroupAvatar(conversationId, mediaId),
    onSuccess: invalidate,
  });
}

export function useRemoveGroupAvatar(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: () => removeGroupAvatar(conversationId),
    onSuccess: invalidate,
  });
}

export function useAddGroupMembers(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (participantIds: string[]) => addGroupMembers(conversationId, participantIds),
    onSuccess: invalidate,
  });
}

export function useRemoveGroupMember(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (memberId: string) => removeGroupMember(conversationId, memberId),
    onSuccess: invalidate,
  });
}

export function useUpdateGroupMemberRole(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: GroupMemberRole }) =>
      updateGroupMemberRole(conversationId, memberId, role),
    onSuccess: invalidate,
  });
}

export function useTransferGroupOwnership(conversationId: string) {
  const invalidate = useInvalidateChats(conversationId);
  return useMutation({
    mutationFn: (newOwnerId: string) => transferGroupOwnership(conversationId, newOwnerId),
    onSuccess: invalidate,
  });
}

export function useLeaveGroup(conversationId: string) {
  const invalidate = useInvalidateChats();
  return useMutation({ mutationFn: () => leaveGroup(conversationId), onSuccess: invalidate });
}

export function useDeleteGroup(conversationId: string) {
  const invalidate = useInvalidateChats();
  return useMutation({ mutationFn: () => deleteGroup(conversationId), onSuccess: invalidate });
}
