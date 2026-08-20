import { apiClient } from "@/src/api/client";
import {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./types";

export const requestOtp = (payload: RequestOtpRequest) =>
  apiClient
    .post<RequestOtpResponse>("/auth/request-otp", payload)
    .then((res) => res.data);

export const verifyOtp = (payload: VerifyOtpRequest) =>
  apiClient
    .post<VerifyOtpResponse>("/auth/verify-otp", payload)
    .then((res) => res.data);
