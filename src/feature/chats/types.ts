import { UploadProgress } from "@/src/shared/media/mediaApi";

export interface Chat {
  id: string;
  participantId: string;
  name: string;
  avatarUrl?: string | null;
  isGroup?: boolean;
  online?: boolean;
  muted?: boolean;
  mutedUntil?: string | null;
  pinned?: boolean;
  archived?: boolean;
  lastMessage: string;
  latestMessageId?: string;
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

export interface LocalAttachment {
  type: "image" | "video" | "audio" | "document";
  uri: string;
  contentType: string;
  filename: string;
  sizeBytes?: number;
  // Where this attachment's upload got to; survives retries so identifiers stay unchanged.
  upload: UploadProgress;
}

// Everything needed to (re)send a message, kept with it for as long as it is unconfirmed.
export interface OutgoingPayload {
  text?: string;
  attachments: LocalAttachment[];
}

interface MessageCore {
  id: string;
  text: string;
  attachments?: ChatAttachment[];
  reactions?: { userId: string; emoji: string }[];
  senderId?: string;
  fromMe: boolean;
  timestamp: Date;
  edited?: boolean;
  deleted?: boolean;
}

// Acknowledged by the server: carries the server id and the version used for ordering/edits.
export interface ConfirmedMessage extends MessageCore {
  state: "confirmed";
  clientMessageId?: string;
  version: number;
}

// Not yet acknowledged: `id` is the client id, and the payload is what a retry will send.
interface PendingMessage extends MessageCore {
  clientMessageId: string;
  fromMe: true;
  payload: OutgoingPayload;
}

export interface SendingMessage extends PendingMessage {
  state: "sending";
}

export interface FailedMessage extends PendingMessage {
  state: "failed";
  error?: string;
}

// Content this app version cannot render (unknown kind or attachment type).
export interface UnsupportedMessage extends MessageCore {
  state: "unsupported";
  kind: string;
  version: number;
}

export type ChatMessage = ConfirmedMessage | SendingMessage | FailedMessage | UnsupportedMessage;

export const isServerMessage = (
  message: ChatMessage,
): message is ConfirmedMessage | UnsupportedMessage =>
  message.state === "confirmed" || message.state === "unsupported";
