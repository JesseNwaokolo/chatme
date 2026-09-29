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

export interface PickedMedia {
  uri: string;
  kind: "image" | "video";
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ChatAttachment {
  type: "image" | "video" | "audio" | "document";
  url: string;
  filename?: string;
  contentType?: string;
  width?: number;
  height?: number;
}

export interface ChatMessage {
  id: string;
  clientMessageId?: string;
  text: string;
  attachments?: ChatAttachment[];
  version?: number;
  edited?: boolean;
  deleted?: boolean;
  reactions?: { userId: string; emoji: string }[];
  fromMe: boolean;
  timestamp: Date;
  status?: "sending" | "failed";
}
