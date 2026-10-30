import { acquirePresence, releasePresence } from "@/src/api/socket/presenceRegistry";
import { getSocket } from "@/src/api/socket/socketClient";
import {
  PresenceChangedEvent,
  ReceiptChangedEvent,
  TypingStartedEvent,
  TypingStoppedEvent,
} from "@/src/api/socket/types";
import useSocketStore from "@/src/store/useSocketStore";
import useUserStore from "@/src/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "../api/queryKeys";
import { ReceiptFrontiersResponse } from "../api/types";
import { useEffect, useRef, useState } from "react";
import { describeError } from "@/src/helpers/redact";

interface UseConversationSocketOptions {
  conversationId: string;
  participantId: string;
  onMessageChanged?: () => void;
}

export function useConversationSocket({
  conversationId,
  participantId,
  onMessageChanged,
}: UseConversationSocketOptions) {
  const isConnected = useSocketStore((s) => s.isConnected);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const queryClient = useQueryClient();
  const onMessageChangedRef = useRef(onMessageChanged);
  onMessageChangedRef.current = onMessageChanged;

  useEffect(() => {
    if (!isConnected) return;
    const socket = getSocket();
    if (!socket) return;

    const handleAny = (event: string, payload?: { conversationId?: string }) => {
      if (!event.startsWith("message.") || event === "message.created") return;
      if (payload?.conversationId && payload.conversationId !== conversationId) return;
      onMessageChangedRef.current?.();
    };
    socket.onAny(handleAny);
    return () => {
      socket.offAny(handleAny);
    };
  }, [conversationId, isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    // The ack belongs to this effect run; a newer conversation/participant must not be overwritten.
    let cancelled = false;
    acquirePresence(conversationId)
      .then(({ participants, typing }) => {
        if (cancelled) return;
        const participant = participants.find((p) => p.userId === participantId);
        setIsOtherOnline(participant?.status === "online");
        setIsOtherTyping(typing.includes(participantId));
      })
      .catch((err) => {
        if (__DEV__) console.log("[useConversationSocket] acquirePresence failed:", describeError(err));
      });

    return () => {
      cancelled = true;
      releasePresence(conversationId);
    };
  }, [conversationId, participantId, isConnected]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

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
      if (payload.conversationId !== conversationId) return;
      if (payload.userId === useUserStore.getState().user?.id) return;

      queryClient.setQueryData<ReceiptFrontiersResponse>(chatKeys.receipts(conversationId), (old) => {
        const frontier = {
          userId: payload.userId,
          version: payload.version,
          delivered: payload.delivered,
          read: payload.read,
        };
        const items = old?.items ?? [];
        const existing = items.find((f) => f.userId === payload.userId);
        if (existing && existing.version > payload.version) return old;
        return {
          conversationId,
          items: existing
            ? items.map((f) => (f.userId === payload.userId ? frontier : f))
            : [...items, frontier],
        };
      });
    };

    socket.on("presence.changed", handlePresenceChanged);
    socket.on("typing.started", handleTypingStarted);
    socket.on("typing.stopped", handleTypingStopped);
    socket.on("receipt.delivered", handleReceiptChanged);
    socket.on("receipt.read", handleReceiptChanged);

    return () => {
      socket.off("presence.changed", handlePresenceChanged);
      socket.off("typing.started", handleTypingStarted);
      socket.off("typing.stopped", handleTypingStopped);
      socket.off("receipt.delivered", handleReceiptChanged);
      socket.off("receipt.read", handleReceiptChanged);
    };
  }, [conversationId, participantId, isConnected, queryClient]);

  return { isOtherOnline, isOtherTyping };
}
