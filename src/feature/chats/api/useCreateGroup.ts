import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupConversation } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}
