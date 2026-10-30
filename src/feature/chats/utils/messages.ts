import { MessageResponse, ReceiptFrontier } from "../api/types";
import { OutboxEntry } from "@/src/store/useOutboxStore";
import {
  ChatMessage,
  ConfirmedMessage,
  FailedMessage,
  SendingMessage,
  UnsupportedMessage,
} from "../types";

const SUPPORTED_KINDS = new Set(["text", "image", "audio", "video", "document"]);
const SUPPORTED_ATTACHMENT_TYPES = new Set(["image", "audio", "video", "document"]);

const isSupported = (payload: MessageResponse) =>
  SUPPORTED_KINDS.has(payload.kind) &&
  (payload.attachments ?? []).every((a) => SUPPORTED_ATTACHMENT_TYPES.has(a.type));

export function toChatMessage(
  payload: MessageResponse,
  myUserId?: string,
): ConfirmedMessage | UnsupportedMessage {
  const core = {
    id: payload.id,
    senderId: payload.senderId,
    fromMe: payload.senderId === myUserId,
    timestamp: new Date(payload.createdAt),
    edited: !!payload.editedAt,
    deleted: !!payload.deletedAt,
    reactions: payload.reactions,
    version: payload.version ?? 0,
  };

  if (!isSupported(payload)) {
    return { ...core, state: "unsupported", kind: payload.kind, text: "" };
  }

  return {
    ...core,
    state: "confirmed",
    clientMessageId: payload.clientMessageId || undefined,
    text: payload.text ?? "",
    attachments: payload.attachments?.map((a) => ({
      type: a.type,
      url: a.url,
      filename: a.filename,
      contentType: a.contentType,
      width: a.width,
      height: a.height,
    })),
  };
}

export function outboxToChatMessage(entry: OutboxEntry): SendingMessage | FailedMessage {
  const payload = { text: entry.text, attachments: entry.attachments };
  const core = {
    id: entry.clientMessageId,
    clientMessageId: entry.clientMessageId,
    text: entry.text ?? "",
    attachments: entry.attachments.map((a) => ({
      type: a.type,
      url: a.uri,
      filename: a.filename,
      contentType: a.contentType,
    })),
    fromMe: true as const,
    timestamp: new Date(entry.createdAt),
    payload,
  };
  return entry.state === "failed"
    ? { ...core, state: "failed", error: entry.error }
    : { ...core, state: "sending" };
}

// Confirmed history first, then unconfirmed sends that history does not already contain.
export function buildMessages(
  history: MessageResponse[],
  outbox: OutboxEntry[],
  myUserId?: string,
): ChatMessage[] {
  const confirmed = history.map((item) => toChatMessage(item, myUserId)).reverse();
  const confirmedClientIds = new Set(
    history.map((m) => m.clientMessageId).filter((id): id is string => !!id),
  );
  const pending = outbox
    .filter((entry) => !confirmedClientIds.has(entry.clientMessageId))
    .map(outboxToChatMessage);
  return [...confirmed, ...pending];
}

export interface ReceiptThresholds {
  delivered: number;
  read: number;
}

export function computeReceiptThresholds(
  frontiers: ReceiptFrontier[] | undefined,
  myUserId: string | undefined,
  messages: ChatMessage[],
): ReceiptThresholds {
  const none = { delivered: -Infinity, read: -Infinity };
  const others = (frontiers ?? []).filter((f) => f.userId !== myUserId);
  if (others.length === 0) return none;

  const createdAt = new Map(messages.map((m) => [m.id, m.timestamp.getTime()]));
  const through = (boundary: { messageId: string } | null) =>
    boundary ? (createdAt.get(boundary.messageId) ?? -Infinity) : -Infinity;

  return {
    read: Math.min(...others.map((f) => through(f.read))),
    delivered: Math.min(...others.map((f) => Math.max(through(f.delivered), through(f.read)))),
  };
}

export function getReceiptStatus(
  message: ChatMessage,
  thresholds: ReceiptThresholds,
): "sent" | "delivered" | "read" {
  const at = message.timestamp.getTime();
  if (at <= thresholds.read) return "read";
  if (at <= thresholds.delivered) return "delivered";
  return "sent";
}
