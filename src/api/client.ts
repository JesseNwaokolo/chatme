import type { RefreshTokenResponse } from "@/src/feature/auth/api/types";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { create, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";
import { endpoints } from "./endpoints";
import { normalizeError } from "./errors";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshSession = (refreshToken: string) =>
  apiClient
    .post<RefreshTokenResponse>(endpoints.auth.refresh, { refreshToken })
    .then((res) => res.data);

// Local-only session clear: the session is already unrecoverable at these call
// sites, so there's no valid refresh token to notify the server with. Kept
// separate from `src/store/logout.ts` to avoid a require cycle (that module
// calls the auth API, which depends on this client).
const clearSession = () => {
  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
};

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: ((token: string | null) => void)[] = [];

const onRefreshed = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isRefreshCall = originalRequest?.url === endpoints.auth.refresh;

    if (
      error.response?.status !== 401 ||
      isRefreshCall ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(normalizeError(error));
    }

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      clearSession();
      return Promise.reject(normalizeError(error));
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(normalizeError(error));
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const data = await refreshSession(refreshToken);
      useAuthStore.getState().setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      isRefreshing = false;
      onRefreshed(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch {
      isRefreshing = false;
      onRefreshed(null);
      clearSession();
      return Promise.reject(normalizeError(error));
    }
  },
);
