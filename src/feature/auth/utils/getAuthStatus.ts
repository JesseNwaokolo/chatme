import { AuthUser } from "../api/types";

export type AuthStatus = "unauthenticated" | "incomplete" | "complete";

export function getAuthStatus(
  accessToken: string | null,
  user: AuthUser | null,
): AuthStatus {
  if (!accessToken) return "unauthenticated";
  if (!user?.profileComplete) return "incomplete";
  return "complete";
}
