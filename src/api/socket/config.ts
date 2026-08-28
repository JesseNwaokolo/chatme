import { API_BASE_URL } from "@/src/api/config";

// e.g. https://HOST -> wss://HOST/chat
export const SOCKET_URL = API_BASE_URL.replace(/^http/, "ws") + "/chat";
