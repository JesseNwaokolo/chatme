import { useInfiniteQuery } from "@tanstack/react-query";
import { searchMessages } from "./messagesApi";
import { chatKeys } from "./queryKeys";

export function useSearchMessages(conversationId: string, q: string) {
  return useInfiniteQuery({
    queryKey: [...chatKeys.messages(conversationId), "search", q],
    queryFn: ({ pageParam }) =>
      searchMessages(conversationId, { q, limit: 20, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.nextCursor : undefined),
    enabled: q.trim().length > 0,
  });
}
