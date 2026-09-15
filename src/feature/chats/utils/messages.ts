import { ReceiptChangedEvent } from "@/src/api/socket/types";
import { MessageResponse } from "../api/types";
import { ChatMessage } from "../types";

export function toChatMessage(payload: MessageResponse, myUserId?: string): ChatMessage {
  return {
    id: payload.id,
    clientMessageId: payload.clientMessageId,
    text: payload.text,
    fromMe: payload.senderId === myUserId,
    timestamp: new Date(payload.createdAt),
  };
}

function upsertMessage(list: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  const index = list.findIndex(
    (m) =>
      (incoming.clientMessageId && m.clientMessageId === incoming.clientMessageId) ||
      m.id === incoming.id,
  );
  if (index === -1) return [...list, incoming];

  const next = [...list];
  next[index] = incoming;
  return next;
}

export function upsertMessages(list: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  let next = list;
  for (const message of incoming) next = upsertMessage(next, message);
  return next.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function getReceiptStatus(
  message: ChatMessage,
  receipt: ReceiptChangedEvent | null,
): "sent" | "delivered" | "read" {
  if (!receipt) return "sent";

  const messageAt = message.timestamp.getTime();
  if (receipt.read && messageAt <= new Date(receipt.read.at).getTime()) return "read";
  if (messageAt <= new Date(receipt.delivered.at).getTime()) return "delivered";
  return "sent";
}
