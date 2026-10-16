import { chatKeys } from "@/src/feature/chats/api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BlockResponse, blockUser, getBlockedUsers, unblockUser } from "./blocksApi";

export const blockKeys = {
  all: ["blocks"] as const,
  list: () => [...blockKeys.all, "list"] as const,
};

export function useBlockedUsers() {
  return useQuery({ queryKey: blockKeys.list(), queryFn: getBlockedUsers });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockUser,
    onSuccess: (block) => {
      queryClient.setQueryData<BlockResponse[]>(blockKeys.list(), (old) => [
        ...(old ?? []).filter((item) => item.user.id !== block.user.id),
        block,
      ]);
      queryClient.invalidateQueries({ queryKey: blockKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockUser,
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: blockKeys.list() });
      const previous = queryClient.getQueryData<BlockResponse[]>(blockKeys.list());
      queryClient.setQueryData<BlockResponse[]>(blockKeys.list(), (old) =>
        old?.filter((item) => item.user.id !== userId),
      );
      return { previous };
    },
    onError: (_error, _userId, context) => {
      if (context?.previous) queryClient.setQueryData(blockKeys.list(), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useIsBlocked(userId?: string | null) {
  const { data } = useBlockedUsers();
  return !!userId && !!data?.some((item) => item.user.id === userId);
}
