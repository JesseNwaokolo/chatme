import { acquirePresence, releasePresence } from "@/src/api/socket/presenceRegistry";
import { getSocket } from "@/src/api/socket/socketClient";
import {
  MessageCreatedEvent,
  PresenceChangedEvent,
  ReceiptChangedEvent,
  TypingStartedEvent,
  TypingStoppedEvent,
} from "@/src/api/socket/types";
import useSocketStore from "@/src/store/useSocketStore";
import { useEffect, useRef, useState } from "react";

interface UseConversationSocketOptions {
  conversationId: string;
  participantId: string;
  onMessageCreated: (payload: MessageCreatedEvent) => void;
}

export function useConversationSocket({
  conversationId,
  participantId,
  onMessageCreated,
}: UseConversationSocketOptions) {
  const isConnected = useSocketStore((s) => s.isConnected);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherReceipt, setOtherReceipt] = useState<ReceiptChangedEvent | null>(null);

  const onMessageCreatedRef = useRef(onMessageCreated);
  onMessageCreatedRef.current = onMessageCreated;

  useEffect(() => {
    if (!isConnected) return;

    acquirePresence(conversationId)
      .then(({ participants, typing }) => {
        const participant = participants.find((p) => p.userId === participantId);
        setIsOtherOnline(participant?.status === "online");
        setIsOtherTyping(typing.includes(participantId));
      })
      .catch((err) => {
        if (__DEV__) console.log("[useConversationSocket] acquirePresence failed:", err);
      });

    return () => {
      releasePresence(conversationId);
    };
  }, [conversationId, participantId, isConnected]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessageCreated = (payload: MessageCreatedEvent) => {
      if (payload.conversationId !== conversationId) return;
      onMessageCreatedRef.current(payload);
    };
    const handlePresenceChanged = (payload: PresenceChangedEvent) => {
      if (payload.conversationId !== conversationId || payload.userId !== participantId) return;
      setIsOtherOnline(payload.status === "online");
    };
    const handleTypingStarted = (payload: TypingStartedEvent) => {
      if (payload.conversationId !== conversationId || payload.userId !== participantId) return;
      setIsOtherTyping(true);
    };
    const handleTypingStopped = (payload: TypingStoppedEvent) => {
      if (payload.conversationId !== conversationId || payload.userId !== participantId) return;
      setIsOtherTyping(false);
    };
    const handleReceiptChanged = (payload: ReceiptChangedEvent) => {
      if (payload.conversationId !== conversationId || payload.userId !== participantId) return;
      setOtherReceipt((prev) => (!prev || payload.version >= prev.version ? payload : prev));
    };

    socket.on("message.created", handleMessageCreated);
    socket.on("presence.changed", handlePresenceChanged);
    socket.on("typing.started", handleTypingStarted);
    socket.on("typing.stopped", handleTypingStopped);
    socket.on("receipt.delivered", handleReceiptChanged);
    socket.on("receipt.read", handleReceiptChanged);

    return () => {
      socket.off("message.created", handleMessageCreated);
      socket.off("presence.changed", handlePresenceChanged);
      socket.off("typing.started", handleTypingStarted);
      socket.off("typing.stopped", handleTypingStopped);
      socket.off("receipt.delivered", handleReceiptChanged);
      socket.off("receipt.read", handleReceiptChanged);
    };
  }, [conversationId, participantId, isConnected]);

  return { isOtherOnline, isOtherTyping, otherReceipt };
}
