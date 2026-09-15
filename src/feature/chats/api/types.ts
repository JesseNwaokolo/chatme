import { ReceiptBoundary } from "@/src/api/socket/types";

export type { ConversationListResponse, ConversationResponse } from "@/src/shared/types/conversation";

export interface MessageResponse {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: "text";
  text: string;
  createdAt: string;
}

export interface SendMessageRequest {
  clientMessageId: string;
  text: string;
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
