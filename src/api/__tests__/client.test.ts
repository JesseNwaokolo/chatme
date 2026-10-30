import { apiClient, refreshAccessToken } from "../client";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: () => undefined,
    set: () => undefined,
    remove: () => undefined,
    delete: () => undefined,
  }),
}));
jest.mock("../queryPersister", () => ({ clearPersistedCache: jest.fn() }));

type Deferred = { resolve: (v: any) => void; reject: (e: unknown) => void };

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

const tokens = (n: string) => ({ accessToken: `a-${n}`, refreshToken: `r-${n}` });

function deferredAdapter() {
  const calls: { config: any; d: Deferred }[] = [];
  apiClient.defaults.adapter = (config: any) =>
    new Promise((resolve, reject) => {
      calls.push({ config, d: { resolve, reject } });
    });
  return calls;
}

const ok = (config: any, data: unknown) => ({
  data, status: 200, statusText: "OK", headers: {}, config,
});
const fail = (config: any, status: number) =>
  Object.assign(new Error("fail"), {
    config,
    isAxiosError: true,
    response: { status, data: {}, headers: {}, config },
  });
const networkFail = (config: any) =>
  Object.assign(new Error("Network Error"), { config, isAxiosError: true });

beforeEach(() => {
  useAuthStore.getState().clearTokens();
  useAuthStore.getState().setTokens(tokens("A"));
});

test("concurrent refreshes share one request", async () => {
  const calls = deferredAdapter();
  const p1 = refreshAccessToken();
  const p2 = refreshAccessToken();
  await flush();
  expect(calls).toHaveLength(1);
  calls[0].d.resolve(ok(calls[0].config, tokens("A2")));
  await expect(p1).resolves.toBe("a-A2");
  await expect(p2).resolves.toBe("a-A2");
});

test("late refresh success after logout does not restore credentials", async () => {
  const calls = deferredAdapter();
  const p = refreshAccessToken();
  await flush();
  useAuthStore.getState().clearTokens();
  calls[0].d.resolve(ok(calls[0].config, tokens("A2")));
  await expect(p).rejects.toThrow("Session changed");
  expect(useAuthStore.getState().accessToken).toBeNull();
});

test("account A's late success cannot replace account B's credentials", async () => {
  const calls = deferredAdapter();
  const p = refreshAccessToken();
  await flush();
  useAuthStore.getState().clearTokens();
  useAuthStore.getState().setTokens(tokens("B"));
  calls[0].d.resolve(ok(calls[0].config, tokens("A2")));
  await expect(p).rejects.toThrow("Session changed");
  expect(useAuthStore.getState().accessToken).toBe("a-B");
});

test("account A's late failure cannot clear account B's session", async () => {
  const calls = deferredAdapter();
  const p = refreshAccessToken();
  await flush();
  useAuthStore.getState().clearTokens();
  useAuthStore.getState().setTokens(tokens("B"));
  calls[0].d.reject(fail(calls[0].config, 401));
  await expect(p).rejects.toThrow("Session changed");
  expect(useAuthStore.getState().accessToken).toBe("a-B");
});

test("rejected refresh credentials end the session", async () => {
  const calls = deferredAdapter();
  const clearUser = jest.spyOn(useUserStore.getState(), "clearUser");
  const p = refreshAccessToken();
  await flush();
  calls[0].d.reject(fail(calls[0].config, 401));
  await expect(p).rejects.toBeDefined();
  expect(useAuthStore.getState().accessToken).toBeNull();
  expect(clearUser).toHaveBeenCalled();
});

test("network failure during refresh keeps the session", async () => {
  const calls = deferredAdapter();
  const p = refreshAccessToken();
  await flush();
  calls[0].d.reject(networkFail(calls[0].config));
  await expect(p).rejects.toBeDefined();
  expect(useAuthStore.getState().refreshToken).toBe("r-A");
});

test("server error during refresh keeps the session", async () => {
  const calls = deferredAdapter();
  const p = refreshAccessToken();
  await flush();
  calls[0].d.reject(fail(calls[0].config, 503));
  await expect(p).rejects.toBeDefined();
  expect(useAuthStore.getState().refreshToken).toBe("r-A");
});
