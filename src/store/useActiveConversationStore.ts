import { create } from "zustand";

interface ActiveConversationStore {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const useActiveConversationStore = create<ActiveConversationStore>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
}));

export default useActiveConversationStore;
