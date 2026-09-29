import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Chat } from "../types";
import { pinConversation, unpinConversation } from "./chatsApi";
import { chatKeys } from "./queryKeys";

type QueryClient = ReturnType<typeof useQueryClient>;

const setPinned = (conversationId: string, pinned: boolean, queryClient: QueryClient) => {
  const previous = queryClient.getQueryData<Chat[]>(chatKeys.list());
  queryClient.setQueryData<Chat[]>(chatKeys.list(), (chats) =>
    chats?.map((chat) => (chat.id === conversationId ? { ...chat, pinned } : chat))
  );
  return previous;
};

export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => pinConversation(conversationId),
    onMutate: async (conversationId: string) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.list() });
      const previousList = setPinned(conversationId, true, queryClient);
      return { previousList };
    },
    onError: (_err, _conversationId, context) => {
      if (context?.previousList) queryClient.setQueryData(chatKeys.list(), context.previousList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}

export function useUnpinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => unpinConversation(conversationId),
    onMutate: async (conversationId: string) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.list() });
      const previousList = setPinned(conversationId, false, queryClient);
      return { previousList };
    },
    onError: (_err, _conversationId, context) => {
      if (context?.previousList) queryClient.setQueryData(chatKeys.list(), context.previousList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}
