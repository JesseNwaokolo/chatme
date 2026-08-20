export interface ChatResponse {
  id: string;
  name: string;
  isGroup?: boolean;
  online?: boolean;
  muted?: boolean;
  pinned?: boolean;
  archived?: boolean;
  lastMessage: string;
  fromMe?: boolean;
  timestamp: string;
  unreadCount?: number;
}

export interface SendMessageRequest {
  chatId: string;
  text: string;
}
