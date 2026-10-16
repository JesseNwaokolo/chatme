import { MessageResponse, ReceiptFrontier } from "../api/types";
import { ChatMessage } from "../types";

export function toChatMessage(payload: MessageResponse, myUserId?: string): ChatMessage {
  return {
    id: payload.id,
    clientMessageId: payload.clientMessageId,
    text: payload.text ?? "",
    attachments: payload.attachments?.map((a) => ({
      type: a.type,
      url: a.url,
      filename: a.filename,
      contentType: a.contentType,
      width: a.width,
      height: a.height,
    })),
    version: payload.version,
    edited: !!payload.editedAt,
    deleted: !!payload.deletedAt,
    reactions: payload.reactions,
    senderId: payload.senderId,
    fromMe: payload.senderId === myUserId,
    timestamp: new Date(payload.createdAt),
  };
}

export function buildMessages(
  history: MessageResponse[],
  pending: ChatMessage[],
  myUserId?: string,
): ChatMessage[] {
  const confirmed = history.map((item) => toChatMessage(item, myUserId)).reverse();
  const confirmedClientIds = new Set(confirmed.map((m) => m.clientMessageId));
  return [...confirmed, ...pending.filter((m) => !confirmedClientIds.has(m.clientMessageId))];
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
