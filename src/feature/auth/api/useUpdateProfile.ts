import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "./profileApi";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
  });
}
