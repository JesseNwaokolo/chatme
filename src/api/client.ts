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

const clearSession = () => {
  useAuthStore.getState().clearTokens();
  useUserStore.getState().clearUser();
};

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    clearSession();
    return Promise.reject(new Error("No refresh token"));
  }

  refreshPromise = apiClient
    .post<RefreshTokenResponse>(endpoints.auth.refresh, { refreshToken })
    .then((res) => {
      useAuthStore.getState().setTokens({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data.accessToken;
    })
    .catch((err) => {
      clearSession();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
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
      originalRequest._retry
    ) {
      return Promise.reject(normalizeError(error));
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch {
      return Promise.reject(normalizeError(error));
    }
  },
);
