import type { UploadProgress } from "@/src/shared/media/mediaApi";

const mockStorage = new Map<string, string>();
jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: (key: string) => mockStorage.get(key),
    set: (key: string, value: string) => void mockStorage.set(key, value),
    remove: (key: string) => void mockStorage.delete(key),
  }),
}));

const progress = (): UploadProgress => ({ clientUploadId: "up-1", stage: "create" });
const entry = (id: string, state: "sending" | "failed" = "sending") => ({
  clientMessageId: id,
  text: "hi",
  attachments: [
    { type: "image" as const, uri: "file://a.jpg", contentType: "image/jpeg", filename: "a.jpg", upload: progress() },
  ],
  state,
  createdAt: 1,
});

describe("outbox store", () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.resetModules();
  });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const load = () => require("../useOutboxStore") as typeof import("../useOutboxStore");

  it("keeps accounts and conversations apart", () => {
    const { default: store, outboxScope } = load();
    store.getState().enqueue(outboxScope("alice", "c1"), entry("a"));
    store.getState().enqueue(outboxScope("bob", "c1"), entry("b"));
    expect(store.getState().entries[outboxScope("alice", "c1")]).toHaveLength(1);
    expect(store.getState().entries[outboxScope("bob", "c1")]?.[0].clientMessageId).toBe("b");
  });

  it("records upload progress per attachment and removes entries", () => {
    const { default: store } = load();
    store.getState().enqueue("s", entry("a"));
    store.getState().updateAttachment("s", "a", 0, { upload: { clientUploadId: "up-1", stage: "complete", mediaId: "m9" } });
    expect(store.getState().entries.s[0].attachments[0].upload).toEqual({
      clientUploadId: "up-1",
      stage: "complete",
      mediaId: "m9",
    });
    store.getState().remove("s", "a");
    expect(store.getState().entries.s).toBeUndefined();
  });

  it("restores unsent messages after a restart, with in-flight ones marked failed", () => {
    const first = load();
    first.default.getState().enqueue("s", entry("a", "sending"));
    first.default.getState().enqueue("s", entry("b", "failed"));

    jest.resetModules();
    const second = load();
    const restored = second.default.getState().entries.s;
    expect(restored.map((e) => [e.clientMessageId, e.state])).toEqual([
      ["a", "failed"],
      ["b", "failed"],
    ]);
    expect(restored[0].attachments[0].upload.clientUploadId).toBe("up-1");
  });

  it("clearAll removes every account's pending messages", () => {
    const { default: store } = load();
    store.getState().enqueue("alice:c1", entry("a"));
    store.getState().clearAll();
    expect(store.getState().entries).toEqual({});
  });
});
