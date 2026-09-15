import { refreshAccessToken } from "@/src/api/client";
import useAuthStore from "@/src/store/useAuthStore";
import useSocketStore from "@/src/store/useSocketStore";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

export function getSocket(): ChatSocket | null {
  return socket;
}

export function connectSocket() {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken || socket?.connected) return;

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    extraHeaders: { Authorization: `Bearer ${accessToken}` },
    timeout: 90_000,
    reconnection: true,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    useSocketStore.getState().setConnected(true);
    useSocketStore.getState().setLastError(null);
  });
  socket.on("disconnect", (reason) => {
    useSocketStore.getState().setConnected(false);
    if (__DEV__) console.log("[socket] disconnect:", reason);
  });
  socket.on("connect_error", handleConnectError);
}

async function handleConnectError(err: Error & { data?: { code?: string } }) {
  const message = err.data?.code ? `${err.data.code}: ${err.message}` : err.message;
  if (__DEV__) console.log("[socket] connect_error:", message, err);
  useSocketStore.getState().setLastError(message);

  if (err.data?.code !== "AUTH_ACCESS_TOKEN_INVALID") return;

  try {
    await refreshAccessToken();
    reconnectSocket();
  } catch {
    disconnectSocket();
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
