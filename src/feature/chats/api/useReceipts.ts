import { useQuery } from "@tanstack/react-query";
import { getReceipts } from "./messagesApi";
import { chatKeys } from "./queryKeys";

export function useReceipts(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.receipts(conversationId),
    queryFn: () => getReceipts(conversationId),
    enabled: !!conversationId,
  });
}
