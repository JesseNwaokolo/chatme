export interface ConversationParticipant {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ConversationLatestMessage {
  id: string;
  senderId: string;
  kind: "text";
  preview: string;
  createdAt: string;
}

export interface ConversationSettings {
  archived: boolean;
  muted: boolean;
  pinned: boolean;
  favorited: boolean;
  archivedAt: string | null;
  mutedAt: string | null;
  mutedUntil: string | null;
  pinnedAt: string | null;
  favoritedAt: string | null;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
}

export interface GroupParticipant extends ConversationParticipant {
  role: "owner" | "member";
}

interface ConversationResponseBase {
  id: string;
  latestMessage: ConversationLatestMessage | null;
  unreadCount: number;
  settings?: ConversationSettings;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectConversationResponse extends ConversationResponseBase {
  type: "direct";
  otherParticipant: ConversationParticipant;
}

export interface GroupConversationResponse extends ConversationResponseBase {
  type: "group";
  name: string;
  avatarUrl: string | null;
  participants: GroupParticipant[];
}

export type ConversationResponse = DirectConversationResponse | GroupConversationResponse;

export interface ConversationListResponse {
  items: ConversationResponse[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
