export const endpoints = {
  auth: {
    requestOtp: "/v1/auth/otp/request",
    resendOtp: "/v1/auth/otp/resend",
    verifyOtp: "/v1/auth/otp/verify",
    refresh: "/v1/auth/refresh",
    logout: "/v1/auth/logout",
  },
  user: {
    getProfile: "/v1/me",
    updateProfile: "/v1/me",
  },
} as const;
