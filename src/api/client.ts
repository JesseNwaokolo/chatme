import useAuthStore from "@/src/store/useAuthStore";
import { create } from "axios";
import { API_BASE_URL } from "./config";
import { normalizeError } from "./errors";

export const apiClient = create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);
