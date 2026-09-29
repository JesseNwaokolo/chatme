import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { queryCacheStorage } from "@/src/store/storage/queryCacheStorage";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function reviveDates(key: string, value: unknown) {
  if (key === "timestamp" && typeof value === "string" && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

export const queryPersister = createSyncStoragePersister({
  storage: queryCacheStorage,
  deserialize: (cached) => JSON.parse(cached, reviveDates),
});
