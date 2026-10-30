import { Chat } from "../types";
import { ConversationResponse, MuteDuration } from "../api/types";

export interface MuteState {
  muted?: boolean;
  mutedUntil?: string | null;
}

const DURATION_MS: Record<Exclude<MuteDuration, "always">, number> = {
  "8_hours": 8 * 60 * 60 * 1000,
  "24_hours": 24 * 60 * 60 * 1000,
  "7_days": 7 * 24 * 60 * 60 * 1000,
};

// Server settings are the only source of truth. A timed mute lapses on its own, so the
// expiry is checked against the clock rather than waiting for a refetch.
export function isChatMuted(state: MuteState | undefined | null, now = Date.now()): boolean {
  if (!state?.muted) return false;
  if (!state.mutedUntil) return true;
  const until = Date.parse(state.mutedUntil);
  return Number.isNaN(until) ? true : until > now;
}

export function muteStateFor(duration: MuteDuration | null, now = Date.now()) {
  if (duration === null) return { muted: false, mutedUntil: null };
  return {
    muted: true,
    mutedUntil: duration === "always" ? null : new Date(now + DURATION_MS[duration]).toISOString(),
  };
}

export function patchChatListMute(
  chats: Chat[] | undefined,
  conversationId: string,
  next: { muted: boolean; mutedUntil: string | null },
): Chat[] | undefined {
  return chats?.map((chat) => (chat.id === conversationId ? { ...chat, ...next } : chat));
}

export function patchConversationMute(
  conversation: ConversationResponse | undefined,
  next: { muted: boolean; mutedUntil: string | null },
): ConversationResponse | undefined {
  if (!conversation?.settings) return conversation;
  return {
    ...conversation,
    settings: {
      ...conversation.settings,
      ...next,
      mutedAt: next.muted ? new Date().toISOString() : null,
    },
  };
}
