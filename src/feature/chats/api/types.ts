import { ReceiptBoundary } from "@/src/api/socket/types";
import { ConversationSettings, MessageAttachment, MessageKind } from "@/src/shared/types/conversation";

export type { ConversationListResponse, ConversationResponse } from "@/src/shared/types/conversation";

export interface MessageResponse {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: MessageKind;
  text: string | null;
  attachments?: MessageAttachment[];
  createdAt: string;
  replyToMessageId?: string | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  version?: number;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export type ReactionEmoji = "👍" | "❤️" | "😂" | "😮" | "😢" | "🙏";
export const REACTION_EMOJIS: ReactionEmoji[] = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export type MuteDuration = "8_hours" | "24_hours" | "7_days" | "always";

export type GroupMemberRole = "admin" | "member";

export interface ConversationSettingsResponse extends ConversationSettings {
  conversationId: string;
}

export interface ConversationReadStateResponse {
  conversationId: string;
  lastReadAt: string;
  unreadCount: number;
}

export interface ClearMessagesResponse {
  conversationId: string;
  changed: boolean;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
}

export interface DeleteDirectChatResponse extends ClearMessagesResponse {
  deletedAt: string | null;
}

export interface SendMessageRequest {
  clientMessageId: string;
  replyToMessageId?: string;
  text?: string;
  attachmentMediaIds?: string[];
}

export interface MessageListResponse {
  items: MessageResponse[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface ReceiptActionResponse {
  conversationId: string;
  status: "delivered" | "read";
  throughMessageId: string;
  at: string;
  changed: boolean;
  unreadCount: number;
  version: number;
  delivered: ReceiptBoundary;
  read: ReceiptBoundary | null;
}
