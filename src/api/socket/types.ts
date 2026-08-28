export interface ReceiptBoundary {
  messageId: string;
  at: string;
}

export interface MessageCreatedEvent {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: "text";
  text: string;
  createdAt: string;
}

export interface ReceiptChangedEvent {
  conversationId: string;
  userId: string;
  throughMessageId: string;
  at: string;
  version: number;
  delivered: ReceiptBoundary;
  read: ReceiptBoundary | null;
}

export interface PresenceChangedEvent {
  conversationId: string;
  userId: string;
  status: "online" | "offline";
  occurredAt: string;
}

export interface TypingStartedEvent {
  conversationId: string;
  userId: string;
  expiresAt: string;
}

export interface TypingStoppedEvent {
  conversationId: string;
  userId: string;
  occurredAt: string;
}

interface AckOk<T> {
  ok: true;
  data: T;
}

interface AckErr {
  ok: false;
  error: { code: string; message: string };
}

export type Ack<T> = (res: AckOk<T> | AckErr) => void;

export interface PresenceSubscribeAck {
  conversationId: string;
  participants: { userId: string; status: "online" | "offline" }[];
  typing: string[];
}

export interface PresenceUnsubscribeAck {
  conversationId: string;
}

export interface TypingStartAck {
  conversationId: string;
  expiresAt: string;
}

export interface TypingStopAck {
  conversationId: string;
}

export interface ServerToClientEvents {
  "message.created": (payload: MessageCreatedEvent) => void;
  "receipt.delivered": (payload: ReceiptChangedEvent) => void;
  "receipt.read": (payload: ReceiptChangedEvent) => void;
  "presence.changed": (payload: PresenceChangedEvent) => void;
  "typing.started": (payload: TypingStartedEvent) => void;
  "typing.stopped": (payload: TypingStoppedEvent) => void;
}

export interface ClientToServerEvents {
  "presence.subscribe": (payload: { conversationId: string }, ack: Ack<PresenceSubscribeAck>) => void;
  "presence.unsubscribe": (payload: { conversationId: string }, ack: Ack<PresenceUnsubscribeAck>) => void;
  "typing.start": (payload: { conversationId: string }, ack: Ack<TypingStartAck>) => void;
  "typing.stop": (payload: { conversationId: string }, ack: Ack<TypingStopAck>) => void;
}
