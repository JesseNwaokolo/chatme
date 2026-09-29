export type MessageKind = "text" | "image" | "audio" | "video" | "document";

export interface MessageAttachment {
  mediaId: string;
  type: Exclude<MessageKind, "text">;
  contentType: string;
  sizeBytes: number;
  url: string;
  width?: number;
  height?: number;
  durationMs?: number;
  filename?: string;
}

export interface ConversationParticipant {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ConversationLatestMessage {
  id: string;
  senderId: string;
  kind: MessageKind;
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
  role: "owner" | "admin" | "member";
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
  role?: "owner" | "admin" | "member";
}

export type ConversationResponse = DirectConversationResponse | GroupConversationResponse;

export interface ConversationListResponse {
  items: ConversationResponse[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
