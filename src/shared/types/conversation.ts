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

export interface ConversationResponse {
  id: string;
  type: "direct";
  otherParticipant: ConversationParticipant;
  latestMessage: ConversationLatestMessage | null;
  unreadCount: number;
  settings?: ConversationSettings;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse {
  items: ConversationResponse[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
