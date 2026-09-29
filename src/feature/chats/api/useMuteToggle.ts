import useMutedChatsStore from "@/src/store/useMutedChatsStore";
import Toast from "react-native-toast-message";
import { useMuteConversation, useUnmuteConversation } from "./useConversationActions";

/**
 * Mutes/unmutes a conversation on the server (source of truth) and mirrors it in the
 * local store, which the in-app banner uses to suppress notifications instantly.
 */
export function useMuteToggle(conversationId: string, serverMuted?: boolean) {
  const localMuted = useMutedChatsStore((s) => s.mutedConversationIds.includes(conversationId));
  const muteLocal = useMutedChatsStore((s) => s.mute);
  const unmuteLocal = useMutedChatsStore((s) => s.unmute);
  const muteMutation = useMuteConversation(conversationId);
  const unmuteMutation = useUnmuteConversation(conversationId);

  const isMuted = serverMuted ?? localMuted;

  const setMuted = (muted: boolean) => {
    if (muted) {
      muteLocal(conversationId);
      muteMutation.mutate("always", {
        onError: () => {
          unmuteLocal(conversationId);
          Toast.show({ type: "error", text1: "Couldn't mute chat" });
        },
      });
    } else {
      unmuteLocal(conversationId);
      unmuteMutation.mutate(undefined, {
        onError: () => {
          muteLocal(conversationId);
          Toast.show({ type: "error", text1: "Couldn't unmute chat" });
        },
      });
    }
  };

  return { isMuted, setMuted };
}
