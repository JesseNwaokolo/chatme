import { refreshAccessToken } from "@/src/api/client";
import useAuthStore from "@/src/store/useAuthStore";
import useSocketStore from "@/src/store/useSocketStore";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";
import { redactString } from "@/src/helpers/redact";

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

export function getSocket(): ChatSocket | null {
  return socket;
}

export function connectSocket() {
  const { accessToken, sessionId } = useAuthStore.getState();
  if (!accessToken) return;
  // One socket per session: a connected *or* still-connecting/reconnecting socket is reused.
  if (socket && (socket.connected || socket.active)) return;
  // A dead socket is disposed before it is replaced so its listeners cannot outlive it.
  if (socket) disconnectSocket();

  const current: ChatSocket = io(SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    extraHeaders: { Authorization: `Bearer ${accessToken}` },
    timeout: 90_000,
    reconnection: true,
    reconnectionDelay: 1000,
  });
  socket = current;

  current.on("connect", () => {
    if (socket !== current) return;
    useSocketStore.getState().setConnected(true);
    useSocketStore.getState().setLastError(null);
  });
  current.on("disconnect", (reason) => {
    if (socket !== current) return;
    useSocketStore.getState().setConnected(false);
    if (__DEV__) console.log("[socket] disconnect:", reason);
  });
  current.on("connect_error", (err) => {
    if (socket !== current) return;
    void handleConnectError(current, sessionId, err);
  });
}

async function handleConnectError(
  owner: ChatSocket,
  sessionId: number,
  err: Error & { data?: { code?: string } },
) {
  const message = err.data?.code ? `${err.data.code}: ${err.message}` : err.message;
  if (__DEV__) console.log("[socket] connect_error:", redactString(message));
  useSocketStore.getState().setLastError(message);

  if (err.data?.code !== "AUTH_ACCESS_TOKEN_INVALID") return;

  // Only act while this socket and this session still own the result.
  const stillOwner = () =>
    socket === owner && useAuthStore.getState().sessionId === sessionId;

  try {
    await refreshAccessToken();
    if (stillOwner()) reconnectSocket();
  } catch {
    if (stillOwner()) disconnectSocket();
  }
}

export function reconnectSocket() {
  disconnectSocket();
  connectSocket();
}

export function disconnectSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  useSocketStore.getState().setConnected(false);
}
