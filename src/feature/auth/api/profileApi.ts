import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import { AuthUser, UpdateProfileRequest, UpdateProfileResponse } from "./types";

export const getProfile = () =>
  apiClient.get<AuthUser>(endpoints.user.getProfile).then((res) => res.data);

export const updateProfile = (payload: UpdateProfileRequest) =>
  apiClient
    .patch<UpdateProfileResponse>(endpoints.user.updateProfile, payload)
    .then((res) => res.data);
