import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistedClient } from "@tanstack/react-query-persist-client";
import { queryCacheStorage } from "@/src/store/storage/queryCacheStorage";
import { queryClient } from "./queryClient";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const MAX_PERSISTED_CONVERSATIONS = 30;

const isMessagesKey = (key: readonly unknown[]) =>
  key[0] === "chats" && key[1] === "messages" && key.length === 3;

function reviveDates(key: string, value: unknown) {
  if (key === "timestamp" && typeof value === "string" && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

function serialize(client: PersistedClient) {
  const messageQueries = client.clientState.queries
    .filter((q) => isMessagesKey(q.queryKey))
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt);
  const kept = new Set(messageQueries.slice(0, MAX_PERSISTED_CONVERSATIONS).map((q) => q.queryHash));

  const queries = client.clientState.queries
    .filter((q) => !isMessagesKey(q.queryKey) || kept.has(q.queryHash))
    .map((q) => {
      const data = q.state.data as { pages?: unknown[]; pageParams?: unknown[] } | undefined;
      if (!isMessagesKey(q.queryKey) || !data?.pages) return q;
      return {
        ...q,
        state: {
          ...q.state,
          data: { pages: data.pages.slice(0, 1), pageParams: (data.pageParams ?? []).slice(0, 1) },
        },
      };
    });

  return JSON.stringify({ ...client, clientState: { ...client.clientState, queries } });
}

export const queryPersister = createSyncStoragePersister({
  storage: queryCacheStorage,
  serialize,
  deserialize: (cached) => JSON.parse(cached, reviveDates),
  throttleTime: 500,
});

export function clearPersistedCache() {
  queryClient.clear();
  queryPersister.removeClient();
}
