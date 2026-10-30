import type { MessageResponse } from "../../api/types";
import { QueryClient } from "@tanstack/react-query";
import { chatKeys } from "../../api/queryKeys";
import { mergeMessage, upsertMessageInCache } from "../messageCache";

const base = {
  id: "m1",
  conversationId: "c1",
  text: "original",
  version: 1,
  deletedAt: null,
} as unknown as MessageResponse;

test("an older response cannot undo a newer deletion", () => {
  const deleted = { ...base, version: 3, text: "", deletedAt: "2026-01-01T00:00:00Z" } as MessageResponse;
  const result = mergeMessage(deleted, base);
  expect(result).toBe(deleted);
  expect(result.text).toBe("");
});

test("a newer response replaces the cached message", () => {
  const edited = { ...base, version: 2, text: "edited" } as MessageResponse;
  expect(mergeMessage(base, edited).text).toBe("edited");
});

test("an equal-version observation still merges", () => {
  const withReaction = { ...base, reactions: [{ userId: "u", emoji: "👍" }] } as MessageResponse;
  expect(mergeMessage(base, withReaction).reactions).toHaveLength(1);
});

describe("one logical message, however it arrives", () => {
  const confirmed = {
    ...base,
    id: "srv-1",
    clientMessageId: "cli-1",
    createdAt: "2026-01-01T00:00:00Z",
  } as MessageResponse;

  const seeded = (items: MessageResponse[]) => {
    const client = new QueryClient();
    client.setQueryData(chatKeys.messages("c1"), {
      pages: [{ items, hasMore: false, nextCursor: null }],
      pageParams: [undefined],
    });
    return client;
  };
  const items = (client: QueryClient) =>
    (client.getQueryData(chatKeys.messages("c1")) as { pages: { items: MessageResponse[] }[] }).pages[0].items;

  it("socket event then HTTP response (same client id) shows one message", () => {
    const client = seeded([confirmed]);
    upsertMessageInCache(client, { ...confirmed });
    expect(items(client)).toHaveLength(1);
  });

  it("HTTP response then socket event (same server id) shows one message", () => {
    const client = seeded([]);
    upsertMessageInCache(client, confirmed);
    upsertMessageInCache(client, { ...confirmed });
    expect(items(client)).toHaveLength(1);
  });

  it("a stale copy after an edit does not roll the edit back", () => {
    const client = seeded([{ ...confirmed, version: 2, text: "edited" } as MessageResponse]);
    upsertMessageInCache(client, confirmed); // version 1 arrives late
    expect(items(client)[0].text).toBe("edited");
  });
});
