import { useQuery } from "@tanstack/react-query";
import { matchContacts } from "./contactsApi";
import { contactKeys } from "./queryKeys";

export function useMatchContacts(phoneNumbers: string[]) {
  return useQuery({
    queryKey: contactKeys.match(phoneNumbers),
    queryFn: () => matchContacts(phoneNumbers),
    enabled: phoneNumbers.length > 0,
  });
}
