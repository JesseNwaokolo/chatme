import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage/mmkvStorage";

interface DraftStore {
  // Keyed by `${accountId}:${conversationId}`.
  drafts: Record<string, string>;
  setDraft: (scope: string, text: string) => void;
  clearAll: () => void;
}

const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (scope, text) =>
        set((s) => {
          if (text.length === 0) {
            if (!(scope in s.drafts)) return s;
            const { [scope]: _removed, ...rest } = s.drafts;
            return { drafts: rest };
          }
          return { drafts: { ...s.drafts, [scope]: text } };
        }),
      clearAll: () => set({ drafts: {} }),
    }),
    { name: "draft-storage", storage: createJSONStorage(() => mmkvStorage) },
  ),
);

export default useDraftStore;
