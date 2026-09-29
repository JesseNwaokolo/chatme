import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chat } from "../types";
import { archiveConversation, unarchiveConversation } from "./chatsApi";
import { chatKeys } from "./queryKeys";

type QueryClient = ReturnType<typeof useQueryClient>;
type ArchivedPage = { items: Chat[]; pageInfo: { nextCursor?: string; hasNextPage: boolean } };
type ArchivedData = InfiniteData<ArchivedPage>;

const setArchived = (conversationId: string, archived: boolean, queryClient: QueryClient) => {
  const previous = queryClient.getQueryData<Chat[]>(chatKeys.list());
  queryClient.setQueryData<Chat[]>(chatKeys.list(), (chats) =>
    chats?.map((chat) => (chat.id === conversationId ? { ...chat, archived } : chat))
  );
  return previous;
};

const insertIntoArchived = (chat: Chat, queryClient: QueryClient) => {
  const previous = queryClient.getQueryData<ArchivedData>(chatKeys.archived());
  queryClient.setQueryData<ArchivedData>(chatKeys.archived(), (data) => {
    if (!data || !data.pages[0]) return data;
    const [first, ...rest] = data.pages;
    return {
      ...data,
      pages: [{ ...first, items: [{ ...chat, archived: true }, ...first.items] }, ...rest],
    };
  });
  return previous;
};

const removeFromArchived = (conversationId: string, queryClient: QueryClient) => {
  const previous = queryClient.getQueryData<ArchivedData>(chatKeys.archived());
  queryClient.setQueryData<ArchivedData>(chatKeys.archived(), (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter((c) => c.id !== conversationId),
          })),
        }
      : data
  );
  return previous;
};

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => archiveConversation(conversationId),
    onMutate: async (conversationId: string) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.list() });
      await queryClient.cancelQueries({ queryKey: chatKeys.archived() });

      const previousList = setArchived(conversationId, true, queryClient);
      const chat = previousList?.find((c) => c.id === conversationId);
      const previousArchived = chat ? insertIntoArchived(chat, queryClient) : undefined;

      return { previousList, previousArchived };
    },
    onError: (_err, _conversationId, context) => {
      if (context?.previousList) queryClient.setQueryData(chatKeys.list(), context.previousList);
      if (context?.previousArchived !== undefined) {
        queryClient.setQueryData(chatKeys.archived(), context.previousArchived);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatKeys.archived() });
    },
  });
}

export function useUnarchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => unarchiveConversation(conversationId),
    onMutate: async (conversationId: string) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.list() });
      await queryClient.cancelQueries({ queryKey: chatKeys.archived() });

      const previousList = setArchived(conversationId, false, queryClient);
      const previousArchived = removeFromArchived(conversationId, queryClient);

      return { previousList, previousArchived };
    },
    onError: (_err, _conversationId, context) => {
      if (context?.previousList) queryClient.setQueryData(chatKeys.list(), context.previousList);
      if (context?.previousArchived !== undefined) {
        queryClient.setQueryData(chatKeys.archived(), context.previousArchived);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatKeys.archived() });
    },
  });
}
