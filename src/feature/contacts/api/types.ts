export interface DiscoveryUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ContactMatch {
  matchedPhoneNumber: string;
  user: DiscoveryUser;
}

export interface MatchContactsRequest {
  phoneNumbers: string[];
}

export interface MatchContactsResponse {
  matches: ContactMatch[];
}

export interface CreateDirectConversationRequest {
  participantId: string;
}

export type { ConversationResponse } from "@/src/shared/types/conversation";

export interface SearchUsersResponse {
  items: DiscoveryUser[];
  nextCursor: string | null;
}
