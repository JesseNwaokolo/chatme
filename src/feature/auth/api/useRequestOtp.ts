import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "./authApi";

export function useRequestOtp() {
  return useMutation({
    mutationFn: requestOtp,
  });
}
