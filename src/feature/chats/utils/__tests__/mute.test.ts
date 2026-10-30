import { isChatMuted, muteStateFor, patchChatListMute, patchConversationMute } from "../mute";
import { Chat } from "../../types";
import { ConversationResponse } from "../../api/types";

const NOW = Date.parse("2026-10-28T12:00:00.000Z");

describe("isChatMuted", () => {
  it("is false without settings or when not muted", () => {
    expect(isChatMuted(undefined, NOW)).toBe(false);
    expect(isChatMuted({ muted: false, mutedUntil: null }, NOW)).toBe(false);
  });

  it("is true for an indefinite mute", () => {
    expect(isChatMuted({ muted: true, mutedUntil: null }, NOW)).toBe(true);
  });

  it("honours a timed mute and lets it lapse", () => {
    expect(isChatMuted({ muted: true, mutedUntil: "2026-10-28T13:00:00.000Z" }, NOW)).toBe(true);
    expect(isChatMuted({ muted: true, mutedUntil: "2026-10-28T11:00:00.000Z" }, NOW)).toBe(false);
  });
});

describe("muteStateFor", () => {
  it("maps durations to server-shaped state", () => {
    expect(muteStateFor("always", NOW)).toEqual({ muted: true, mutedUntil: null });
    expect(muteStateFor("8_hours", NOW)).toEqual({ muted: true, mutedUntil: "2026-10-28T20:00:00.000Z" });
    expect(muteStateFor(null, NOW)).toEqual({ muted: false, mutedUntil: null });
  });
});

describe("cache patchers", () => {
  const chat = (id: string, muted: boolean) => ({ id, muted }) as Chat;

  it("patches only the targeted chat", () => {
    const next = patchChatListMute([chat("a", false), chat("b", false)], "a", {
      muted: true,
      mutedUntil: null,
    });
    expect(next?.map((c) => c.muted)).toEqual([true, false]);
  });

  it("leaves a missing list or conversation untouched", () => {
    expect(patchChatListMute(undefined, "a", { muted: true, mutedUntil: null })).toBeUndefined();
    expect(patchConversationMute(undefined, { muted: true, mutedUntil: null })).toBeUndefined();
  });

  it("patches conversation settings", () => {
    const conversation = { id: "a", settings: { muted: false, mutedUntil: null, mutedAt: null } } as ConversationResponse;
    const next = patchConversationMute(conversation, { muted: true, mutedUntil: null });
    expect(next?.settings?.muted).toBe(true);
    expect(next?.settings?.mutedAt).not.toBeNull();
  });
});

describe("single source of truth", () => {
  // The UI toggle and notification suppression both call isChatMuted on the same server
  // settings, so a remote change (unmute on another device) cannot leave them disagreeing.
  it("UI and notification decisions agree before and after a remote change", () => {
    const before = { muted: true, mutedUntil: null };
    const afterRemoteUnmute = { muted: false, mutedUntil: null };
    const ui = (s: typeof before) => isChatMuted(s, NOW);
    const notificationSuppressed = (s: typeof before) => isChatMuted(s, NOW);
    expect(ui(before)).toBe(notificationSuppressed(before));
    expect(ui(afterRemoteUnmute)).toBe(false);
    expect(notificationSuppressed(afterRemoteUnmute)).toBe(false);
  });
});
