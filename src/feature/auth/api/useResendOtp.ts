import { useMutation } from "@tanstack/react-query";
import { resendOtp } from "./authApi";

export function useResendOtp() {
  return useMutation({
    mutationFn: resendOtp,
  });
}
