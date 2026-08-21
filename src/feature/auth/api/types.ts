export interface RequestOtpRequest {
  phoneNumber: string;
}

export interface RequestOtpResponse {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
}

export interface ResendOtpRequest {
  challengeId: string;
}

export interface ResendOtpResponse {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
}

export interface DeviceInfo {
  name: string;
  platform: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  displayName: string;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: AuthUser;
}

export interface VerifyOtpRequest {
  challengeId: string;
  code: string;
  device: DeviceInfo;
}

export type VerifyOtpResponse = AuthSession;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type RefreshTokenResponse = AuthSession;

export interface UpdateProfileRequest {
  displayName: string;
  avatarUrl: string;
}

export type UpdateProfileResponse = AuthUser;
