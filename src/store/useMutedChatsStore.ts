import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage/mmkvStorage";

interface MutedChatsStore {
  mutedConversationIds: string[];
  isMuted: (conversationId: string) => boolean;
  mute: (conversationId: string) => void;
  unmute: (conversationId: string) => void;
}

const useMutedChatsStore = create<MutedChatsStore>()(
  persist(
    (set, get) => ({
      mutedConversationIds: [],
      isMuted: (conversationId) => get().mutedConversationIds.includes(conversationId),
      mute: (conversationId) =>
        set((state) =>
          state.mutedConversationIds.includes(conversationId)
            ? state
            : { mutedConversationIds: [...state.mutedConversationIds, conversationId] }
        ),
      unmute: (conversationId) =>
        set((state) => ({
          mutedConversationIds: state.mutedConversationIds.filter((id) => id !== conversationId),
        })),
    }),
    {
      name: "muted-chats-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useMutedChatsStore;
