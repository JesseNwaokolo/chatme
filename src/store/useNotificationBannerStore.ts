import { create } from "zustand";

export interface BannerPayload {
  id: string;
  conversationId: string;
  participantId: string;
  name: string;
  avatarUrl?: string | null;
  isGroup?: boolean;
  text: string;
}

interface NotificationBannerStore {
  banner: BannerPayload | null;
  show: (payload: BannerPayload) => void;
  dismiss: () => void;
}

const useNotificationBannerStore = create<NotificationBannerStore>((set) => ({
  banner: null,
  show: (banner) => set({ banner }),
  dismiss: () => set({ banner: null }),
}));

export default useNotificationBannerStore;
