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

export interface ConversationResponse {
  id: string;
  type: "direct";
  otherParticipant: ConversationParticipant;
  latestMessage: ConversationLatestMessage | null;
  unreadCount: number;
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
