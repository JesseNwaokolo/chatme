import { chatKeys } from "@/src/feature/chats/api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blockUser, getBlockedUsers, unblockUser } from "./blocksApi";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.list() });
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
