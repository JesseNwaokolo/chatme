import { useMutation } from "@tanstack/react-query";
import { getProfile } from "./profileApi";

export function useGetProfile() {
  return useMutation({
    mutationFn: getProfile,
  });
}
