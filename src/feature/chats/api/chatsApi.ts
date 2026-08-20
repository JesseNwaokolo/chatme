import { apiClient } from "@/src/api/client";
import { Chat } from "../types";
import { ChatResponse, SendMessageRequest } from "./types";

const toChat = (response: ChatResponse): Chat => ({
  ...response,
  timestamp: new Date(response.timestamp),
});

export const getChats = () =>
  apiClient
    .get<ChatResponse[]>("/chats")
    .then((res) => res.data.map(toChat));

export const sendMessage = (payload: SendMessageRequest) =>
  apiClient
    .post<ChatResponse>(`/chats/${payload.chatId}/messages`, payload)
    .then((res) => toChat(res.data));
