import { getSocket } from "./socketClient";
import type { PresenceSubscribeAck, PresenceUnsubscribeAck, TypingStartAck, TypingStopAck } from "./types";

function emitWithAck<T>(
  event: "presence.subscribe" | "presence.unsubscribe" | "typing.start" | "typing.stop",
  payload: { conversationId: string },
): Promise<T> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    if (!socket) return reject(new Error("Socket not connected"));

    const emit = socket.emit.bind(socket) as (
      event: string,
      payload: { conversationId: string },
      ack: (res: { ok: true; data: T } | { ok: false; error: { code: string; message: string } }) => void,
    ) => void;

    emit(event, payload, (res) => {
      if (res.ok) {
        resolve(res.data);
      } else {
        reject(res.error);
      }
    });
  });
}

export const subscribePresence = (conversationId: string) =>
  emitWithAck<PresenceSubscribeAck>("presence.subscribe", { conversationId });

export const unsubscribePresence = (conversationId: string) =>
  emitWithAck<PresenceUnsubscribeAck>("presence.unsubscribe", { conversationId });

export const startTyping = (conversationId: string) =>
  emitWithAck<TypingStartAck>("typing.start", { conversationId });

export const stopTyping = (conversationId: string) =>
  emitWithAck<TypingStopAck>("typing.stop", { conversationId });
