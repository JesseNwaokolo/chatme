import { ConversationCheck, createNotificationCoordinator, parseNotificationIntent } from "../notificationRouting";

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

function setup(initial: { ready: boolean; userId: string | null }, check: ConversationCheck = "ok") {
  const state = { ...initial };
  let clock = 1_000;
  const checkConversation = jest.fn(async () => check);
  const openConversation = jest.fn();
  const showUnavailable = jest.fn();
  const coordinator = createNotificationCoordinator({
    getState: () => state,
    checkConversation,
    openConversation,
    showUnavailable,
    now: () => clock,
  });
  return {
    state,
    coordinator,
    checkConversation,
    openConversation,
    showUnavailable,
    advance: (ms: number) => (clock += ms),
  };
}

describe("parseNotificationIntent", () => {
  it.each([
    [null],
    ["str"],
    [{}],
    [{ conversationId: 5 }],
    [{ conversationId: "" }],
    [{ conversationId: "../../settings" }],
    [{ conversationId: "a/b" }],
    [{ conversationId: "x".repeat(200) }],
  ])("rejects %j", (data) => {
    expect(parseNotificationIntent(data)).toBeNull();
  });

  it("accepts a plain conversation id", () => {
    expect(parseNotificationIntent({ conversationId: "conv_123-abc" })).toEqual({
      conversationId: "conv_123-abc",
      recipientUserId: undefined,
    });
  });
});

describe("notification coordinator", () => {
  it("opens the conversation by id only when ready", async () => {
    const t = setup({ ready: true, userId: "me" });
    t.coordinator.receive("n1", { conversationId: "c1", name: "Injected", route: "/evil" });
    await flush();
    expect(t.openConversation).toHaveBeenCalledWith("c1");
    expect(t.openConversation).toHaveBeenCalledTimes(1);
  });

  it("ignores malformed payloads", async () => {
    const t = setup({ ready: true, userId: "me" });
    t.coordinator.receive("n1", { conversationId: "../x" });
    await flush();
    expect(t.checkConversation).not.toHaveBeenCalled();
    expect(t.openConversation).not.toHaveBeenCalled();
  });

  it("handles the same notification once even if delivered twice", async () => {
    const t = setup({ ready: true, userId: "me" });
    t.coordinator.receive("n1", { conversationId: "c1" });
    t.coordinator.receive("n1", { conversationId: "c1" });
    await flush();
    expect(t.openConversation).toHaveBeenCalledTimes(1);
  });

  it("waits for readiness, then opens (signed out, then login)", async () => {
    const t = setup({ ready: false, userId: null });
    t.coordinator.receive("n1", { conversationId: "c1" });
    await flush();
    expect(t.openConversation).not.toHaveBeenCalled();
    expect(t.coordinator.hasPending()).toBe(true);

    t.state.ready = true;
    t.state.userId = "me";
    await t.coordinator.process();
    expect(t.openConversation).toHaveBeenCalledWith("c1");
  });

  it("drops an intent tapped under one account when another is signed in", async () => {
    const t = setup({ ready: false, userId: "alice" });
    t.coordinator.receive("n1", { conversationId: "c1" });
    t.state.userId = "bob";
    t.state.ready = true;
    await t.coordinator.process();
    expect(t.checkConversation).not.toHaveBeenCalled();
    expect(t.openConversation).not.toHaveBeenCalled();
  });

  it("ignores a notification addressed to a different recipient", async () => {
    const t = setup({ ready: true, userId: "me" });
    t.coordinator.receive("n1", { conversationId: "c1", recipientUserId: "someone-else" });
    await flush();
    expect(t.openConversation).not.toHaveBeenCalled();
  });

  it("ignores the result if the account changes while the conversation is being checked", async () => {
    const t = setup({ ready: true, userId: "alice" });
    t.checkConversation.mockImplementationOnce(async () => {
      t.state.userId = "bob";
      return "ok";
    });
    t.coordinator.receive("n1", { conversationId: "c1" });
    await flush();
    expect(t.openConversation).not.toHaveBeenCalled();
  });

  it("falls back safely when the conversation is missing or inaccessible", async () => {
    const t = setup({ ready: true, userId: "me" }, "unavailable");
    t.coordinator.receive("n1", { conversationId: "gone" });
    await flush();
    expect(t.showUnavailable).toHaveBeenCalled();
    expect(t.openConversation).not.toHaveBeenCalled();
  });

  it("still opens when the check can't be completed (e.g. offline)", async () => {
    const t = setup({ ready: true, userId: "me" }, "unknown");
    t.coordinator.receive("n1", { conversationId: "c1" });
    await flush();
    expect(t.openConversation).toHaveBeenCalledWith("c1");
  });

  it("expires intents that waited too long", async () => {
    const t = setup({ ready: false, userId: null });
    t.coordinator.receive("n1", { conversationId: "c1" });
    t.advance(3 * 60 * 1000);
    t.state.ready = true;
    t.state.userId = "me";
    await t.coordinator.process();
    expect(t.openConversation).not.toHaveBeenCalled();
  });

  it("a newer notification supersedes one still being checked", async () => {
    const t = setup({ ready: true, userId: "me" });
    t.coordinator.receive("n1", { conversationId: "first" });
    t.coordinator.receive("n2", { conversationId: "second" });
    await flush();
    expect(t.openConversation.mock.calls.map((c) => c[0])).toEqual(["second"]);
  });
});
