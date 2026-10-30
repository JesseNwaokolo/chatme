import useSocketStore from "@/src/store/useSocketStore";
import { subscribePresence, unsubscribePresence } from "./commands";
import type { PresenceSubscribeAck } from "./types";


const refCounts = new Map<string, number>();

useSocketStore.subscribe((state, prevState) => {

  if (!state.isConnected && prevState.isConnected) {
    refCounts.clear();
  }
});

export function acquirePresence(conversationId: string): Promise<PresenceSubscribeAck> {
  refCounts.set(conversationId, (refCounts.get(conversationId) ?? 0) + 1);
  return subscribePresence(conversationId);
}

export function releasePresence(conversationId: string): void {
  const count = refCounts.get(conversationId);
  // No entry means the connection dropped and the server already forgot this subscription;
  // unsubscribing now could cancel one re-acquired after reconnect.
  if (count === undefined) return;
  const next = count - 1;
  if (next <= 0) {
    refCounts.delete(conversationId);
    unsubscribePresence(conversationId).catch(() => {});
  } else {
    refCounts.set(conversationId, next);
  }
}
