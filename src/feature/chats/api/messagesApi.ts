import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import {
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
