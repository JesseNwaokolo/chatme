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
    avatar: "/v1/me/avatar",
  },
  contacts: {
    match: "/v1/contacts/match",
  },
  conversations: {
    createDirect: "/v1/conversations/direct",
    createGroup: "/v1/conversations/group",
    list: "/v1/conversations",
    archivedList: "/v1/conversations/archived",
    detail: (conversationId: string) => `/v1/conversations/${conversationId}`,
    messages: (conversationId: string) => `/v1/conversations/${conversationId}/messages`,
    receiptsDelivered: (conversationId: string) =>
      `/v1/conversations/${conversationId}/receipts/delivered`,
    receiptsRead: (conversationId: string) => `/v1/conversations/${conversationId}/receipts/read`,
    archive: (conversationId: string) => `/v1/conversations/${conversationId}/archive`,
    pin: (conversationId: string) => `/v1/conversations/${conversationId}/pin`,
    favorites: "/v1/conversations/favorites",
    avatar: (conversationId: string) => `/v1/conversations/${conversationId}/avatar`,
    members: (conversationId: string) => `/v1/conversations/${conversationId}/members`,
    member: (conversationId: string, memberId: string) =>
      `/v1/conversations/${conversationId}/members/${memberId}`,
    memberRole: (conversationId: string, memberId: string) =>
      `/v1/conversations/${conversationId}/members/${memberId}/role`,
    transferOwnership: (conversationId: string) =>
      `/v1/conversations/${conversationId}/transfer-ownership`,
    leave: (conversationId: string) => `/v1/conversations/${conversationId}/leave`,
    deleteForMe: (conversationId: string) => `/v1/conversations/${conversationId}/for-me`,
    settings: (conversationId: string) => `/v1/conversations/${conversationId}/settings`,
    mute: (conversationId: string) => `/v1/conversations/${conversationId}/mute`,
    favorite: (conversationId: string) => `/v1/conversations/${conversationId}/favorite`,
    read: (conversationId: string) => `/v1/conversations/${conversationId}/read`,
    receipts: (conversationId: string) => `/v1/conversations/${conversationId}/receipts`,
    searchMessages: (conversationId: string) =>
      `/v1/conversations/${conversationId}/messages/search`,
    message: (conversationId: string, messageId: string) =>
      `/v1/conversations/${conversationId}/messages/${messageId}`,
    reaction: (conversationId: string, messageId: string) =>
      `/v1/conversations/${conversationId}/messages/${messageId}/reaction`,
  },
  blocks: {
    list: "/v1/me/blocks",
    user: (userId: string) => `/v1/me/blocks/${userId}`,
  },
  push: {
    device: (installationId: string) => `/v1/me/push-devices/${installationId}`,
  },
  health: "/v1/health",
  media: {
    createUpload: "/v1/media/uploads",
    completeUpload: (mediaId: string) => `/v1/media/uploads/${mediaId}/complete`,
  },
  discovery: {
    searchUsers: "/v1/users/search",
  },
} as const;
