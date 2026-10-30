import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { MessageCreatedEvent } from "@/src/api/socket/types";
import { chatKeys } from "../api/queryKeys";
import { MessageListResponse, MessageResponse } from "../api/types";

type MessagesData = InfiniteData<MessageListResponse, string | undefined>;

const isSameMessage = (a: MessageResponse, b: MessageResponse) =>
  a.id === b.id || (!!a.clientMessageId && a.clientMessageId === b.clientMessageId);

const byNewest = (a: MessageResponse, b: MessageResponse) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function eventToMessage(event: MessageCreatedEvent): MessageResponse {
  return {
    attachments: [],
    replyToMessageId: null,
    editedAt: null,
    deletedAt: null,
    version: 1,
    reactions: [],
    ...event,
  };
}

// Identity prevents duplicates; version ordering prevents regression. A response that
// is older than what the cache already holds must not overwrite it (e.g. a slow history
// fetch landing after an edit or delete event). Equal versions merge so same-version
// observations (e.g. reaction changes) still apply.
export function mergeMessage(existing: MessageResponse, incoming: MessageResponse): MessageResponse {
  if ((incoming.version ?? 0) < (existing.version ?? 0)) return existing;
  return { ...existing, ...incoming };
}

export function upsertMessageInCache(queryClient: QueryClient, message: MessageResponse) {
  queryClient.setQueryData<MessagesData>(chatKeys.messages(message.conversationId), (old) => {
    if (!old || old.pages.length === 0) return old;

    let found = false;
    const pages = old.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => {
        if (!isSameMessage(item, message)) return item;
        found = true;
        return mergeMessage(item, message);
      }),
    }));

    if (!found) {
      pages[0] = { ...pages[0], items: [message, ...pages[0].items].sort(byNewest) };
    }
    return { ...old, pages };
  });
}

export function patchMessageInCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  patch: (message: MessageResponse) => MessageResponse,
) {
  queryClient.setQueryData<MessagesData>(chatKeys.messages(conversationId), (old) =>
    old
      ? {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === messageId ? patch(item) : item)),
          })),
        }
      : old,
  );
}
