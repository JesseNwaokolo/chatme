import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import { ConversationResponse, MatchContactsResponse, SearchUsersResponse } from "./types";

export const matchContacts = (phoneNumbers: string[]) =>
  apiClient
    .post<MatchContactsResponse>(endpoints.contacts.match, { phoneNumbers })
    .then((res) => res.data);

export const createDirectConversation = (participantId: string) =>
  apiClient
    .post<ConversationResponse>(endpoints.conversations.createDirect, { participantId })
    .then((res) => res.data);

export const searchUsers = (query: string, limit = 20, cursor?: string) =>
  apiClient
    .get<SearchUsersResponse>(endpoints.discovery.searchUsers, {
      params: { q: query, limit, cursor },
    })
    .then((res) => res.data);
