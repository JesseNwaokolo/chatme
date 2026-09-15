export interface Chat {
  id: string;
  participantId: string;
  name: string;
  avatarUrl?: string | null;
  isGroup?: boolean;
  online?: boolean;
  muted?: boolean;
  pinned?: boolean;
  archived?: boolean;
  lastMessage: string;
  fromMe?: boolean;
  timestamp: Date;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  clientMessageId?: string;
  text: string;
  fromMe: boolean;
  timestamp: Date;
  status?: "sending" | "failed";
}
