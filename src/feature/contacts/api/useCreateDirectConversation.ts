import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/src/feature/chats/api/queryKeys";
import { createDirectConversation } from "./contactsApi";

export function useCreateDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: string) => createDirectConversation(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}
