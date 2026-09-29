import { useMutation } from "@tanstack/react-query";
import { deleteMessage, editMessage, removeReaction, setReaction } from "./messagesApi";

export function useEditMessage(conversationId: string) {
  return useMutation({
    mutationFn: (vars: { messageId: string; text: string | null; expectedVersion: number }) =>
      editMessage(conversationId, vars.messageId, {
        text: vars.text,
        expectedVersion: vars.expectedVersion,
      }),
  });
}

export function useDeleteMessage(conversationId: string) {
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(conversationId, messageId),
  });
}

export function useReactToMessage(conversationId: string) {
  return useMutation({
    mutationFn: (vars: { messageId: string; emoji: string | null }) =>
      vars.emoji
        ? setReaction(conversationId, vars.messageId, vars.emoji)
        : removeReaction(conversationId, vars.messageId),
  });
}
