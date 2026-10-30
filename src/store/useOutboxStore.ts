import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LocalAttachment } from "../feature/chats/types";
import { mmkvStorage } from "./storage/mmkvStorage";

export interface OutboxEntry {
  clientMessageId: string;
  text?: string;
  attachments: LocalAttachment[];
  state: "sending" | "failed";
  createdAt: number;
  error?: string;
}

interface OutboxStore {
  // Keyed by `${accountId}:${conversationId}` so one account never sees another's messages.
  entries: Record<string, OutboxEntry[]>;
  enqueue: (scope: string, entry: OutboxEntry) => void;
  update: (scope: string, clientMessageId: string, patch: Partial<OutboxEntry>) => void;
  updateAttachment: (
    scope: string,
    clientMessageId: string,
    index: number,
    patch: Partial<LocalAttachment>,
  ) => void;
  remove: (scope: string, clientMessageId: string) => void;
  clearAll: () => void;
}

export const outboxScope = (accountId: string, conversationId: string) =>
  `${accountId}:${conversationId}`;

const mapEntry = (
  entries: Record<string, OutboxEntry[]>,
  scope: string,
  clientMessageId: string,
  fn: (entry: OutboxEntry) => OutboxEntry,
) => {
  const list = entries[scope];
  if (!list?.some((e) => e.clientMessageId === clientMessageId)) return entries;
  return {
    ...entries,
    [scope]: list.map((e) => (e.clientMessageId === clientMessageId ? fn(e) : e)),
  };
};

const useOutboxStore = create<OutboxStore>()(
  persist(
    (set) => ({
      entries: {},
      enqueue: (scope, entry) =>
        set((s) => ({ entries: { ...s.entries, [scope]: [...(s.entries[scope] ?? []), entry] } })),
      update: (scope, clientMessageId, patch) =>
        set((s) => ({
          entries: mapEntry(s.entries, scope, clientMessageId, (e) => ({ ...e, ...patch })),
        })),
      updateAttachment: (scope, clientMessageId, index, patch) =>
        set((s) => ({
          entries: mapEntry(s.entries, scope, clientMessageId, (e) => ({
            ...e,
            attachments: e.attachments.map((a, i) => (i === index ? { ...a, ...patch } : a)),
          })),
        })),
      remove: (scope, clientMessageId) =>
        set((s) => {
          const list = s.entries[scope];
          if (!list) return s;
          const next = list.filter((e) => e.clientMessageId !== clientMessageId);
          const { [scope]: _removed, ...rest } = s.entries;
          return { entries: next.length ? { ...rest, [scope]: next } : rest };
        }),
      clearAll: () => set({ entries: {} }),
    }),
    {
      name: "outbox-storage",
      storage: createJSONStorage(() => mmkvStorage),
      // A send that was in flight when the app died has no live request any more; surface it
      // as failed so the user can retry it.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<OutboxStore> | undefined)?.entries ?? {};
        const entries = Object.fromEntries(
          Object.entries(saved).map(([scope, list]) => [
            scope,
            list.map((e) => (e.state === "sending" ? { ...e, state: "failed" as const } : e)),
          ]),
        );
        return { ...current, entries };
      },
    },
  ),
);

export default useOutboxStore;
