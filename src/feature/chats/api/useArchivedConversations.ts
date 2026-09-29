import { useInfiniteQuery } from "@tanstack/react-query";
import { getArchivedConversations } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useArchivedConversations() {
  return useInfiniteQuery({
    queryKey: chatKeys.archived(),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getArchivedConversations({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? (lastPage.pageInfo.nextCursor ?? undefined) : undefined,
  });
}
