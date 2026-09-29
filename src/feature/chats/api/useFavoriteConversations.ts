import { useInfiniteQuery } from "@tanstack/react-query";
import { getFavoriteConversations } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useFavoriteConversations() {
  return useInfiniteQuery({
    queryKey: [...chatKeys.all, "favorites"] as const,
    queryFn: ({ pageParam }) => getFavoriteConversations({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.nextCursor : undefined),
  });
}
