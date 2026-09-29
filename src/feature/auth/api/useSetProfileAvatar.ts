import { uploadMedia } from "@/src/shared/media/mediaApi";
import { useMutation } from "@tanstack/react-query";
import { setProfileAvatar } from "./profileApi";

/** Uploads a local image as a profile_avatar and selects it as the user's avatar. */
export function useSetProfileAvatar() {
  return useMutation({
    mutationFn: async (localUri: string) => {
      const media = await uploadMedia({ uri: localUri, purpose: "profile_avatar" });
      return setProfileAvatar(media.id);
    },
  });
}
