import { useQuery } from "@tanstack/react-query";
import { getConversation } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.detail(conversationId),
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  });
}
