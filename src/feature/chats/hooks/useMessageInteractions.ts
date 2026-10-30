import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { MessageResponse } from "../api/types";
import { useDeleteMessage, useEditMessage, useReactToMessage } from "../api/useMessageActions";
import { ChatMessage, ConfirmedMessage } from "../types";
import { patchMessageInCache, upsertMessageInCache } from "../utils/messageCache";

const errorText = (error: unknown) => (error instanceof Error ? error.message : undefined);

// React, edit and delete on confirmed messages, applying server results to the cache.
export function useMessageInteractions(conversationId: string, myUserId: string | undefined) {
  const queryClient = useQueryClient();
  const editMutation = useEditMessage(conversationId);
  const deleteMutation = useDeleteMessage(conversationId);
  const reactMutation = useReactToMessage(conversationId);

  const applyServerMessage = (data: MessageResponse) => upsertMessageInCache(queryClient, data);

  const react = (message: ChatMessage, emoji: string | null) => {
    if (!myUserId || message.state !== "confirmed") return;

    const previousReactions = message.reactions ?? [];
    const previousMine = previousReactions.find((r) => r.userId === myUserId);
    const nextMine = emoji ? { userId: myUserId, emoji } : undefined;
    const nextReactions = [
      ...previousReactions.filter((r) => r.userId !== myUserId),
      ...(nextMine ? [nextMine] : []),
    ];
    // Undo only this user's optimistic change, and only if it is still the current value;
    // other participants' reactions that arrived meanwhile are left alone.
    const rollbackMine = () =>
      patchMessageInCache(queryClient, conversationId, message.id, (m) => {
        const current = m.reactions ?? [];
        const currentMine = current.find((r) => r.userId === myUserId);
        if (currentMine?.emoji !== nextMine?.emoji) return m;
        return {
          ...m,
          reactions: [
            ...current.filter((r) => r.userId !== myUserId),
            ...(previousMine ? [previousMine] : []),
          ],
        };
      });

    patchMessageInCache(queryClient, conversationId, message.id, (m) => ({
      ...m,
      reactions: nextReactions,
    }));
    reactMutation.mutate(
      { messageId: message.id, emoji },
      {
        onSuccess: (data) => {
          if (data.reactions) applyServerMessage(data);
        },
        onError: (error) => {
          rollbackMine();
          Toast.show({ type: "error", text1: "Couldn't update reaction", text2: errorText(error) });
        },
      },
    );
  };

  const confirmDelete = (message: ChatMessage) => {
    if (message.state !== "confirmed") return;
    Alert.alert("Delete message", "This deletes the message for everyone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(message.id, {
            onSuccess: applyServerMessage,
            onError: (error) =>
              Toast.show({ type: "error", text1: "Couldn't delete message", text2: errorText(error) }),
          }),
      },
    ]);
  };

  const edit = (message: ConfirmedMessage, text: string, onDone: () => void) => {
    if (!text && !message.attachments?.length) return;
    editMutation.mutate(
      { messageId: message.id, text: text || null, expectedVersion: message.version },
      {
        onSuccess: (data) => {
          applyServerMessage(data);
          onDone();
        },
        onError: (error) =>
          Toast.show({
            type: "error",
            text1: "Couldn't edit message",
            text2: errorText(error) ?? "Please try again.",
          }),
      },
    );
  };

  return { react, confirmDelete, edit };
}
