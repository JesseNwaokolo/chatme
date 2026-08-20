import { AxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function normalizeError(error: AxiosError<{ message?: string; code?: string }>): ApiError {
  const status = error.response?.status ?? 0;
  const message = error.response?.data?.message ?? error.message ?? "Request failed";
  const code = error.response?.data?.code;
  return new ApiError(status, message, code);
}
