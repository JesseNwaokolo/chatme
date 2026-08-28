import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "./contactsApi";
import { contactKeys } from "./queryKeys";

export const MIN_SEARCH_QUERY_LENGTH = 3;

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: contactKeys.search(query),
    queryFn: () => searchUsers(query),
    enabled: query.trim().length >= MIN_SEARCH_QUERY_LENGTH,
  });
}
