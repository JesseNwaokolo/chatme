import { create } from "zustand";

interface SocketStore {
  isConnected: boolean;
  setConnected: (isConnected: boolean) => void;
  lastError: string | null;
  setLastError: (lastError: string | null) => void;
}

const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
  lastError: null,
  setLastError: (lastError) => set({ lastError }),
}));

export default useSocketStore;
