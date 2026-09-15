import { acquirePresence, releasePresence } from "@/src/api/socket/presenceRegistry";
import { getSocket } from "@/src/api/socket/socketClient";
import { PresenceChangedEvent } from "@/src/api/socket/types";
import useSocketStore from "@/src/store/useSocketStore";
import { useCallback, useEffect, useRef, useState } from "react";

interface VisibleChat {
  conversationId: string;
  participantId: string;
}

export function useVisiblePresence() {
  const [onlineByConversationId, setOnlineByConversationId] = useState<Record<string, boolean>>(
    {},
  );
  const subscribedRef = useRef<Map<string, string>>(new Map());
  const lastVisibleRef = useRef<VisibleChat[]>([]);
  const isConnected = useSocketStore((s) => s.isConnected);
  const isConnectedRef = useRef(isConnected);
  isConnectedRef.current = isConnected;

  const subscribeOne = useCallback((chat: VisibleChat) => {
    subscribedRef.current.set(chat.conversationId, chat.participantId);
    acquirePresence(chat.conversationId)
      .then(({ participants }) => {
        if (!subscribedRef.current.has(chat.conversationId)) return;
        const participant = participants.find((p) => p.userId === chat.participantId);
        setOnlineByConversationId((prev) => ({
          ...prev,
          [chat.conversationId]: participant?.status === "online",
        }));
      })
      .catch(() => {});
  }, []);

  const unsubscribeOne = useCallback((conversationId: string) => {
    subscribedRef.current.delete(conversationId);
    releasePresence(conversationId);
    setOnlineByConversationId((prev) => {
      if (!(conversationId in prev)) return prev;
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
  }, []);

  const updateVisible = useCallback(
    (visible: VisibleChat[]) => {
      lastVisibleRef.current = visible;
      if (!isConnectedRef.current) return;

      const visibleIds = new Set(visible.map((c) => c.conversationId));
      for (const conversationId of Array.from(subscribedRef.current.keys())) {
        if (!visibleIds.has(conversationId)) unsubscribeOne(conversationId);
      }
      for (const chat of visible) {
        if (!subscribedRef.current.has(chat.conversationId)) subscribeOne(chat);
      }
    },
    [subscribeOne, unsubscribeOne],
  );

  useEffect(() => {
    if (isConnected) {
      updateVisible(lastVisibleRef.current);
      return;
    }
    // The server-side subscriptions die with the connection, so our local
    // bookkeeping is stale once reconnected — clear it so updateVisible
    // above re-subscribes everything currently visible instead of assuming
    // it's still subscribed.
    subscribedRef.current.clear();
    setOnlineByConversationId({});
  }, [isConnected, updateVisible]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePresenceChanged = (payload: PresenceChangedEvent) => {
      if (!subscribedRef.current.has(payload.conversationId)) return;
      setOnlineByConversationId((prev) => ({
        ...prev,
        [payload.conversationId]: payload.status === "online",
      }));
    };

    socket.on("presence.changed", handlePresenceChanged);
    return () => {
      socket.off("presence.changed", handlePresenceChanged);
    };
  }, [isConnected]);

  useEffect(() => {
    return () => {
      for (const conversationId of subscribedRef.current.keys()) {
        releasePresence(conversationId);
      }
      subscribedRef.current.clear();
    };
  }, []);

  return { onlineByConversationId, updateVisible };
}
