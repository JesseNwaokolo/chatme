import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Chat } from "../types";
import { isChatMuted, muteStateFor, MuteState, patchChatListMute, patchConversationMute } from "../utils/mute";
import { muteConversation, unmuteConversation } from "./chatsApi";
import { chatKeys } from "./queryKeys";
import { ConversationResponse, MuteDuration } from "./types";

type MuteSnapshot = {
  list?: Chat | undefined;
  detail?: ConversationResponse["settings"];
};

// Server settings are the single source of truth. The mutation updates the query cache
// optimistically and, on failure, restores only this conversation's mute fields, so any
// other change that landed in the meantime is kept.
export function useMuteToggle(conversationId: string, state: MuteState | undefined) {
  const queryClient = useQueryClient();
  const listKey = chatKeys.list();
  const detailKey = chatKeys.detail(conversationId);

  const mutation = useMutation({
    mutationFn: (duration: MuteDuration | null) =>
      duration ? muteConversation(conversationId, duration) : unmuteConversation(conversationId),
    onMutate: async (duration) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);
      const next = muteStateFor(duration);
      const snapshot: MuteSnapshot = {
        list: queryClient.getQueryData<Chat[]>(listKey)?.find((c) => c.id === conversationId),
        detail: queryClient.getQueryData<ConversationResponse>(detailKey)?.settings,
      };
      queryClient.setQueryData<Chat[]>(listKey, (old) => patchChatListMute(old, conversationId, next));
      queryClient.setQueryData<ConversationResponse>(detailKey, (old) => patchConversationMute(old, next));
      return { snapshot, next };
    },
    onError: (_error, duration, context) => {
      if (context) {
        const { list, detail } = context.snapshot;
        if (list) {
          queryClient.setQueryData<Chat[]>(listKey, (old) =>
            patchChatListMute(old, conversationId, {
              muted: !!list.muted,
              mutedUntil: list.mutedUntil ?? null,
            }),
          );
        }
        if (detail) {
          queryClient.setQueryData<ConversationResponse>(detailKey, (old) =>
            old?.settings
              ? {
                  ...old,
                  settings: {
                    ...old.settings,
                    muted: detail.muted,
                    mutedAt: detail.mutedAt,
                    mutedUntil: detail.mutedUntil,
                  },
                }
              : old,
          );
        }
      }
      Toast.show({ type: "error", text1: duration ? "Couldn't mute chat" : "Couldn't unmute chat" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
      queryClient.invalidateQueries({ queryKey: chatKeys.archived() });
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });

  const setMuted = (muted: boolean) => mutation.mutate(muted ? "always" : null);

  return { isMuted: isChatMuted(state), setMuted };
}
