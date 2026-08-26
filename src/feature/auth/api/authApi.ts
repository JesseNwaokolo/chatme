import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import {
  LogoutRequest,
  RequestOtpRequest,
  RequestOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./types";

export const requestOtp = (payload: RequestOtpRequest) =>
  apiClient
    .post<RequestOtpResponse>(endpoints.auth.requestOtp, payload)
    .then((res) => res.data);

export const resendOtp = (payload: ResendOtpRequest) =>
  apiClient
    .post<ResendOtpResponse>(endpoints.auth.resendOtp, payload)
    .then((res) => res.data);

export const verifyOtp = (payload: VerifyOtpRequest) =>
  apiClient
    .post<VerifyOtpResponse>(endpoints.auth.verifyOtp, payload)
    .then((res) => res.data);

export const logoutRequest = (payload: LogoutRequest) =>
  apiClient.post<void>(endpoints.auth.logout, payload).then((res) => res.data);
