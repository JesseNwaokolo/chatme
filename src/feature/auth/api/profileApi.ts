import { apiClient } from "@/src/api/client";
import { endpoints } from "@/src/api/endpoints";
import { UpdateProfileRequest, UpdateProfileResponse } from "./types";

export const updateProfile = (payload: UpdateProfileRequest) =>
  apiClient
    .patch<UpdateProfileResponse>(endpoints.user.updateProfile, payload)
    .then((res) => res.data);
