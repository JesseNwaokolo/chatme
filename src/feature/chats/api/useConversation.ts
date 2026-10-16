import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/src/api/errors";
import { getConversation } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.detail(conversationId),
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
    retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 3,
  });
}
