const mockStorage = new Map<string, string>();
jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: (key: string) => mockStorage.get(key),
    set: (key: string, value: string) => void mockStorage.set(key, value),
    remove: (key: string) => void mockStorage.delete(key),
  }),
}));

describe("draft store", () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.resetModules();
  });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const load = () => require("../useDraftStore").default as typeof import("../useDraftStore").default;

  it("keeps drafts apart per account and conversation", () => {
    const store = load();
    store.getState().setDraft("alice:c1", "hello");
    store.getState().setDraft("bob:c1", "other");
    expect(store.getState().drafts["alice:c1"]).toBe("hello");
    expect(store.getState().drafts["bob:c1"]).toBe("other");
    expect(store.getState().drafts["alice:c2"]).toBeUndefined();
  });

  it("survives a restart", () => {
    load().getState().setDraft("alice:c1", "unsent");
    jest.resetModules();
    expect(load().getState().drafts["alice:c1"]).toBe("unsent");
  });

  it("removes the entry when the draft is emptied", () => {
    const store = load();
    store.getState().setDraft("alice:c1", "x");
    store.getState().setDraft("alice:c1", "");
    expect(store.getState().drafts).toEqual({});
  });

  it("clearAll wipes every account's drafts (used on logout)", () => {
    const store = load();
    store.getState().setDraft("alice:c1", "x");
    store.getState().clearAll();
    expect(store.getState().drafts).toEqual({});
    jest.resetModules();
    expect(load().getState().drafts).toEqual({});
  });
});
