import { uploadMedia } from "@/src/shared/media/mediaApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setGroupAvatar } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useUpdateGroupAvatar(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (localUri: string) => {
      const media = await uploadMedia({ uri: localUri, purpose: "group_avatar" });
      return setGroupAvatar(conversationId, media.id);
    },
    onSuccess: (conversation) => {
      queryClient.setQueryData(chatKeys.detail(conversationId), conversation);
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}
