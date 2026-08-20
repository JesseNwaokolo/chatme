import { useQuery } from "@tanstack/react-query";
import { getChats } from "./chatsApi";
import { chatKeys } from "./queryKeys";

export function useChats() {
  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: getChats,
  });
}
