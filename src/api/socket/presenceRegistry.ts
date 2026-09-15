import useSocketStore from "@/src/store/useSocketStore";
import { subscribePresence, unsubscribePresence } from "./commands";
import type { PresenceSubscribeAck } from "./types";

// Multiple independent consumers (the open conversation screen, the
// windowed chat list) can want presence for the same conversationId at
// once. Subscribing is safe to repeat (the ack always returns fresh
// current state), but unsubscribing is destructive — if each consumer
// unsubscribed on its own cleanup, one consumer leaving would silently
// kill another's still-active subscription. Ref-count so unsubscribe only
// actually fires once nobody wants it anymore.
const refCounts = new Map<string, number>();

useSocketStore.subscribe((state, prevState) => {
  // The server-side subscriptions die with the socket, so once it drops,
  // our counts no longer reflect reality — clear them so reconnecting
  // consumers re-acquire from scratch instead of under-counting forever.
  if (!state.isConnected && prevState.isConnected) {
    refCounts.clear();
  }
});

export function acquirePresence(conversationId: string): Promise<PresenceSubscribeAck> {
  refCounts.set(conversationId, (refCounts.get(conversationId) ?? 0) + 1);
  return subscribePresence(conversationId);
}

export function releasePresence(conversationId: string): void {
  const next = (refCounts.get(conversationId) ?? 1) - 1;
  if (next <= 0) {
    refCounts.delete(conversationId);
    unsubscribePresence(conversationId).catch(() => {});
  } else {
    refCounts.set(conversationId, next);
  }
}
