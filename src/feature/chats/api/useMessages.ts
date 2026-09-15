import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "./messagesApi";
import { chatKeys } from "./queryKeys";

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getMessages(conversationId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? (lastPage.pageInfo.nextCursor ?? undefined) : undefined,
  });
}
