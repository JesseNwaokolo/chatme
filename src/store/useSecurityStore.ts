import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage/mmkvStorage";

interface SecurityStore {
  faceIdEnabled: boolean;
  setFaceIdEnabled: (enabled: boolean) => void;
}

const useSecurityStore = create<SecurityStore>()(
  persist(
    (set) => ({
      faceIdEnabled: false,
      setFaceIdEnabled: (enabled: boolean) => set({ faceIdEnabled: enabled }),
    }),
    {
      name: "security-storage",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export default useSecurityStore;
