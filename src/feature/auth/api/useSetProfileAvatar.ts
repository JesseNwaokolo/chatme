import { uploadMedia } from "@/src/shared/media/mediaApi";
import { useMutation } from "@tanstack/react-query";
import { setProfileAvatar } from "./profileApi";

export function useSetProfileAvatar() {
  return useMutation({
    mutationFn: async (localUri: string) => {
      const media = await uploadMedia({ uri: localUri, purpose: "profile_avatar" });
      return setProfileAvatar(media.id);
    },
  });
}
