import type { RefreshTokenResponse } from "@/src/feature/auth/api/types";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { create, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";
import { endpoints } from "./endpoints";
import { normalizeError } from "./errors";
import { clearPersistedCache } from "./queryPersister";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _sessionId?: number;
}

const REQUEST_TIMEOUT_MS = 15_000;

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const getSessionId = () => useAuthStore.getState().sessionId;

const CLEANUP_TIMEOUT_MS = 5_000;

// Config for a request that must run on behalf of a session that has already ended
// (e.g. logout cleanup). It carries its own credentials, is bounded by a short timeout,
// and is never retried through the refresh flow of whichever session is current now.
export const endedSessionConfig = (session: {
  accessToken: string | null;
  sessionId: number;
}): InternalAxiosRequestConfig =>
  ({
    timeout: CLEANUP_TIMEOUT_MS,
    headers: session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
    _sessionId: session.sessionId,
  }) as unknown as InternalAxiosRequestConfig;

const clearSession = () => {
  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
  clearPersistedCache();
};

// The refresh result belongs to the session that started it; if the session changed
// (logout, or another account signed in) the result must be discarded.
export class StaleSessionError extends Error {
  constructor() {
    super("Session changed");
  }
}

// Only a rejection from the server means the refresh credentials are dead.
// Network errors, timeouts and 5xx leave the session intact so it can recover.
const isInvalidCredentials = (err: unknown) => {
  const status = (err as { status?: number })?.status ?? 0;
  return status === 400 || status === 401 || status === 403;
};

let inflightRefresh: { sessionId: number; promise: Promise<string> } | null = null;

export function refreshAccessToken(): Promise<string> {
  const { refreshToken, sessionId } = useAuthStore.getState();

  if (inflightRefresh && inflightRefresh.sessionId === sessionId) {
    return inflightRefresh.promise;
  }

  if (!refreshToken) {
    clearSession();
    return Promise.reject(new Error("No refresh token"));
  }

  const entry: { sessionId: number; promise: Promise<string> } = {
    sessionId,
    promise: apiClient
      .post<RefreshTokenResponse>(endpoints.auth.refresh, { refreshToken })
      .then((res) => {
        if (getSessionId() !== sessionId) throw new StaleSessionError();
        useAuthStore.getState().rotateTokens({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        return res.data.accessToken;
      })
      .catch((err) => {
        if (err instanceof StaleSessionError) throw err;
        if (getSessionId() !== sessionId) throw new StaleSessionError();
        if (isInvalidCredentials(err)) clearSession();
        throw err;
      })
      .finally(() => {
        if (inflightRefresh === entry) inflightRefresh = null;
      }),
  };
  inflightRefresh = entry;

  return entry.promise;
}

apiClient.interceptors.request.use((config: RetryableRequestConfig) => {
  const { accessToken, sessionId } = useAuthStore.getState();
  config._sessionId ??= sessionId;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isRefreshCall = originalRequest?.url === endpoints.auth.refresh;

    if (
      error.response?.status !== 401 ||
      isRefreshCall ||
      !originalRequest ||
      originalRequest._retry ||
      // The request was made by a session that no longer exists.
      originalRequest._sessionId !== getSessionId()
    ) {
      return Promise.reject(normalizeError(error));
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      if (originalRequest._sessionId !== getSessionId()) {
        return Promise.reject(normalizeError(error));
      }
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch {
      return Promise.reject(normalizeError(error));
    }
  },
);
