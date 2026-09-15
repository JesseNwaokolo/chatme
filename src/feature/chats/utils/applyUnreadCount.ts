import { QueryClient } from "@tanstack/react-query";
import { chatKeys } from "../api/queryKeys";
import { Chat } from "../types";

export function applyUnreadCount(
  queryClient: QueryClient,
  conversationId: string,
  unreadCount: number,
) {
  queryClient.setQueryData<Chat[]>(chatKeys.list(), (old) =>
    old?.map((chat) => (chat.id === conversationId ? { ...chat, unreadCount } : chat)),
  );
}
