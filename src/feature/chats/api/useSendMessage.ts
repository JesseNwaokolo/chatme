import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}
