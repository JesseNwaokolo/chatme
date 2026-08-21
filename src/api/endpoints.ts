export const endpoints = {
  auth: {
    requestOtp: "/v1/auth/otp/request",
    resendOtp: "/v1/auth/otp/resend",
    verifyOtp: "/v1/auth/otp/verify",
    refresh: "/v1/auth/refresh",
  },
  user: {
    updateProfile: "/v1/me",
  },
} as const;
