import { MalformedResponseError, parseMessage, parseMessageList, parseMessageResponse } from "../parsers";

const valid = (overrides: Record<string, unknown> = {}) => ({
  id: "m1",
  conversationId: "c1",
  clientMessageId: "cm1",
  senderId: "u1",
  kind: "text",
  text: "hi",
  createdAt: "2026-10-28T10:00:00.000Z",
  version: 2,
  ...overrides,
});

describe("parseMessage", () => {
  it("accepts a valid message and normalises optional fields", () => {
    const message = parseMessage(valid());
    expect(message).toMatchObject({ id: "m1", text: "hi", version: 2, editedAt: null, deletedAt: null });
  });

  it.each([
    ["missing id", valid({ id: undefined })],
    ["missing sender", valid({ senderId: undefined })],
    ["bad timestamp", valid({ createdAt: "not a date" })],
    ["non-string text", valid({ text: 42 })],
    ["non-array attachments", valid({ attachments: "x" })],
    ["unreadable attachment", valid({ attachments: [{ nope: true }] })],
    ["not an object", "oops"],
  ])("rejects %s", (_name, raw) => {
    expect(parseMessage(raw)).toBeNull();
  });

  it("keeps unknown kinds and attachment types so the UI can show a fallback", () => {
    const message = parseMessage(
      valid({ kind: "sticker", attachments: [{ type: "sticker", url: "https://x/y" }] }),
    );
    expect(message?.kind).toBe("sticker");
    expect(message?.attachments?.[0].type).toBe("sticker");
  });

  it("drops invalid reactions but keeps the message", () => {
    const message = parseMessage(valid({ reactions: [{ userId: "u", emoji: "👍" }, { emoji: 1 }] }));
    expect(message?.reactions).toEqual([{ userId: "u", emoji: "👍" }]);
  });
});

describe("parseMessageList", () => {
  const page = (items: unknown[]) => ({ items, pageInfo: { nextCursor: "c", hasNextPage: true } });

  it("isolates malformed items instead of failing the page", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = parseMessageList(page([valid(), { broken: true }, valid({ id: "m2" })]));
    expect(result.items.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("skipped 1"));
    warn.mockRestore();
  });

  it("rejects a broken envelope", () => {
    expect(() => parseMessageList({ items: "no" })).toThrow(MalformedResponseError);
    expect(() => parseMessageList(null)).toThrow(MalformedResponseError);
  });

  it("does not claim a next page without a cursor", () => {
    const result = parseMessageList({ items: [], pageInfo: { nextCursor: null, hasNextPage: true } });
    expect(result.pageInfo).toEqual({ nextCursor: null, hasNextPage: false });
  });
});

describe("parseMessageResponse", () => {
  it("throws on an unusable single message", () => {
    expect(() => parseMessageResponse({})).toThrow(MalformedResponseError);
  });
});
