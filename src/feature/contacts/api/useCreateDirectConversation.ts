import { useMutation } from "@tanstack/react-query";
import { createDirectConversation } from "./contactsApi";

export function useCreateDirectConversation() {
  return useMutation({
    mutationFn: (participantId: string) => createDirectConversation(participantId),
  });
}
