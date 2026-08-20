import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "./authApi";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,
  });
}
