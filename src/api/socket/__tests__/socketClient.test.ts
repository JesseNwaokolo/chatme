type Handler = (...args: any[]) => void;
class MockSocket {
  connected = false;
  active = true;
  handlers = new Map<string, Handler>();
  disposed = false;
  on(event: string, h: Handler) {
    this.handlers.set(event, h);
    return this;
  }
  removeAllListeners() {
    this.handlers.clear();
  }
  disconnect() {
    this.disposed = true;
    this.connected = false;
    this.active = false;
  }
  fire(event: string, ...args: any[]) {
    this.handlers.get(event)?.(...args);
  }
}

const mockSockets: MockSocket[] = [];
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => {
    const s = new MockSocket();
    mockSockets.push(s);
    return s;
  }),
}));
jest.mock("../config", () => ({ SOCKET_URL: "http://test" }));
const mockRefresh = jest.fn();
jest.mock("@/src/api/client", () => ({ refreshAccessToken: () => mockRefresh() }));

let mockAuth = { accessToken: "t", sessionId: 1 };
jest.mock("@/src/store/useAuthStore", () => ({
  __esModule: true,
  default: { getState: () => mockAuth },
}));

import useSocketStore from "@/src/store/useSocketStore";
import { connectSocket, disconnectSocket, getSocket } from "../socketClient";

describe("socket client ownership", () => {
  beforeEach(() => {
    disconnectSocket();
    mockSockets.length = 0;
    mockAuth = { accessToken: "t", sessionId: 1 };
    mockRefresh.mockReset();
  });

  it("does not connect without credentials", () => {
    mockAuth = { accessToken: "", sessionId: 1 };
    connectSocket();
    expect(mockSockets).toHaveLength(0);
  });

  it("reuses a socket that is still connecting instead of creating a second one", () => {
    connectSocket();
    connectSocket();
    connectSocket();
    expect(mockSockets).toHaveLength(1);
  });

  it("disposes a dead socket before replacing it", () => {
    connectSocket();
    const first = mockSockets[0];
    first.active = false; // gave up reconnecting
    connectSocket();
    expect(mockSockets).toHaveLength(2);
    expect(first.disposed).toBe(true);
    expect(first.handlers.size).toBe(0);
    expect(getSocket()).toBe(mockSockets[1]);
  });

  it("ignores events from a replaced socket", () => {
    connectSocket();
    const first = mockSockets[0];
    const staleConnect = first.handlers.get("connect")!;
    first.active = false;
    connectSocket();
    useSocketStore.getState().setConnected(false);
    staleConnect(); // late callback from the disposed socket
    expect(useSocketStore.getState().isConnected).toBe(false);
  });

  it("marks the store connected from the current socket only", () => {
    connectSocket();
    mockSockets[0].fire("connect");
    expect(useSocketStore.getState().isConnected).toBe(true);
    disconnectSocket();
    expect(useSocketStore.getState().isConnected).toBe(false);
    expect(getSocket()).toBeNull();
  });

  it("does not reconnect after token refresh if the session changed meanwhile", async () => {
    connectSocket();
    let release!: () => void;
    mockRefresh.mockReturnValue(new Promise<void>((r) => (release = r)));
    mockSockets[0].fire("connect_error", Object.assign(new Error("bad"), { data: { code: "AUTH_ACCESS_TOKEN_INVALID" } }));
    mockAuth = { accessToken: "t2", sessionId: 2 }; // account switched
    release();
    await new Promise((r) => setImmediate(r));
    expect(mockSockets).toHaveLength(1);
  });
});
