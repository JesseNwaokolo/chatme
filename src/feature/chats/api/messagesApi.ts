import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import {
  ClearMessagesResponse,
  ConversationReadStateResponse,
  MessageListResponse,
  MessageResponse,
  ReceiptActionResponse,
  SendMessageRequest,
} from "./types";

export const sendMessage = (conversationId: string, payload: SendMessageRequest) =>
  apiClient
    .post<MessageResponse>(endpoints.conversations.messages(conversationId), payload)
    .then((res) => res.data);

export const getMessages = (
  conversationId: string,
  params: { limit?: number; cursor?: string } = {},
) =>
  apiClient
    .get<MessageListResponse>(endpoints.conversations.messages(conversationId), { params })
    .then((res) => res.data);

export const markDelivered = (conversationId: string, throughMessageId: string) =>
  apiClient
    .put<ReceiptActionResponse>(endpoints.conversations.receiptsDelivered(conversationId), {
      throughMessageId,
    })
    .then((res) => res.data);

export const markRead = (conversationId: string, throughMessageId: string) =>
  apiClient
    .put<ReceiptActionResponse>(endpoints.conversations.receiptsRead(conversationId), {
      throughMessageId,
    })
    .then((res) => res.data);

export const getMessage = (conversationId: string, messageId: string) =>
  apiClient
    .get<MessageResponse>(endpoints.conversations.message(conversationId, messageId))
    .then((res) => res.data);

export const editMessage = (
  conversationId: string,
  messageId: string,
  body: { text: string | null; expectedVersion: number },
) =>
  apiClient
    .patch<MessageResponse>(endpoints.conversations.message(conversationId, messageId), body)
    .then((res) => res.data);

export const deleteMessage = (conversationId: string, messageId: string) =>
  apiClient
    .delete<MessageResponse>(endpoints.conversations.message(conversationId, messageId))
    .then((res) => res.data);

export const setReaction = (conversationId: string, messageId: string, emoji: string) =>
  apiClient
    .put<MessageResponse>(endpoints.conversations.reaction(conversationId, messageId), { emoji })
    .then((res) => res.data);

export const removeReaction = (conversationId: string, messageId: string) =>
  apiClient
    .delete<MessageResponse>(endpoints.conversations.reaction(conversationId, messageId))
    .then((res) => res.data);

export const searchMessages = (
  conversationId: string,
  params: { q: string; limit?: number; cursor?: string },
) =>
  apiClient
    .get<MessageListResponse>(endpoints.conversations.searchMessages(conversationId), { params })
    .then((res) => res.data);

export const clearConversationMessages = (conversationId: string) =>
  apiClient
    .delete<ClearMessagesResponse>(endpoints.conversations.messages(conversationId))
    .then((res) => res.data);

export const markAllRead = (conversationId: string) =>
  apiClient
    .post<ConversationReadStateResponse>(endpoints.conversations.read(conversationId))
    .then((res) => res.data);

export const getReceipts = (conversationId: string) =>
  apiClient
    .get<unknown>(endpoints.conversations.receipts(conversationId))
    .then((res) => res.data);
