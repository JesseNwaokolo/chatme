import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "./messagesApi";
import { SendMessageRequest } from "./types";

export function useSendMessage(conversationId: string) {
  return useMutation({
    mutationFn: (payload: SendMessageRequest) => sendMessage(conversationId, payload),
  });
}
