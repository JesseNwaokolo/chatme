import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";

export interface BlockedUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface BlockResponse {
  user: BlockedUser;
  blockedAt: string;
}

export const getBlockedUsers = () =>
  apiClient
    .get<{ items: BlockResponse[] }>(endpoints.blocks.list)
    .then((res) => res.data.items);

export const blockUser = (userId: string) =>
  apiClient.put<BlockResponse>(endpoints.blocks.user(userId)).then((res) => res.data);

export const unblockUser = (userId: string) =>
  apiClient.delete<void>(endpoints.blocks.user(userId)).then(() => undefined);
