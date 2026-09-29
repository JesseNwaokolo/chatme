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
  contacts: {
    match: "/v1/contacts/match",
  },
  conversations: {
    createDirect: "/v1/conversations/direct",
    list: "/v1/conversations",
    archivedList: "/v1/conversations/archived",
    detail: (conversationId: string) => `/v1/conversations/${conversationId}`,
    messages: (conversationId: string) => `/v1/conversations/${conversationId}/messages`,
    receiptsDelivered: (conversationId: string) =>
      `/v1/conversations/${conversationId}/receipts/delivered`,
    receiptsRead: (conversationId: string) => `/v1/conversations/${conversationId}/receipts/read`,
    archive: (conversationId: string) => `/v1/conversations/${conversationId}/archive`,
    pin: (conversationId: string) => `/v1/conversations/${conversationId}/pin`,
  },
  discovery: {
    searchUsers: "/v1/users/search",
  },
} as const;
