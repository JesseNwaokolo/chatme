import { OutboxEntry } from "@/src/store/useOutboxStore";
import { MessageResponse } from "../../api/types";
import { buildMessages, toChatMessage } from "../messages";

jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({ getString: () => undefined, set: () => undefined, remove: () => undefined }),
}));

const response = (overrides: Partial<MessageResponse> = {}): MessageResponse => ({
  id: "m1",
  conversationId: "c1",
  clientMessageId: "cm1",
  senderId: "other",
  kind: "text",
  text: "hello",
  createdAt: "2026-10-28T10:00:00.000Z",
  version: 3,
  ...overrides,
});

const entry = (overrides: Partial<OutboxEntry> = {}): OutboxEntry => ({
  clientMessageId: "cm-out",
  text: "draft",
  attachments: [],
  state: "failed",
  createdAt: Date.parse("2026-10-28T11:00:00.000Z"),
  ...overrides,
});

describe("toChatMessage", () => {
  it("confirmed messages carry server id and version", () => {
    expect(toChatMessage(response(), "me")).toMatchObject({
      state: "confirmed",
      id: "m1",
      version: 3,
      fromMe: false,
    });
  });

  it("flags unknown kinds and attachment types as unsupported", () => {
    expect(toChatMessage(response({ kind: "sticker" as never }), "me").state).toBe("unsupported");
    const withOddAttachment = response({
      attachments: [{ mediaId: "x", type: "hologram" as never, contentType: "", sizeBytes: 1, url: "u" }],
    });
    expect(toChatMessage(withOddAttachment, "me").state).toBe("unsupported");
  });
});

describe("buildMessages", () => {
  it("keeps the client id and payload on a failed message so it can be retried", () => {
    const [failed] = buildMessages([], [entry({ text: "retry me" })], "me");
    expect(failed).toMatchObject({
      state: "failed",
      id: "cm-out",
      clientMessageId: "cm-out",
      payload: { text: "retry me", attachments: [] },
    });
  });

  it("hides outbox entries the server has already confirmed", () => {
    const messages = buildMessages([response({ clientMessageId: "cm-out" })], [entry()], "me");
    expect(messages).toHaveLength(1);
    expect(messages[0].state).toBe("confirmed");
  });

  it("orders history oldest first, then unconfirmed sends", () => {
    const messages = buildMessages(
      [response({ id: "new", createdAt: "2026-10-28T10:05:00.000Z" }), response({ id: "old", clientMessageId: "x" })],
      [entry({ state: "sending" })],
      "me",
    );
    expect(messages.map((m) => m.id)).toEqual(["old", "new", "cm-out"]);
  });
});
