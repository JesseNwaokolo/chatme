export interface Chat {
  id: string;
  name: string;
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

export interface SuggestedContact {
  id: string;
  name: string;
}
