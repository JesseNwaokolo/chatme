import VerifyOtp from "@/src/feature/auth/screens/VerifyOtp";
import { useLocalSearchParams } from "expo-router";

const VerifyOtpPage = () => {
  const {
    phone,
    challengeId,
    phoneNumberMasked,
    expiresInSeconds,
    resendInSeconds,
    codeLength,
  } = useLocalSearchParams<{
    phone: string;
    challengeId: string;
    phoneNumberMasked: string;
    expiresInSeconds: string;
    resendInSeconds: string;
    codeLength: string;
  }>();

  return (
    <VerifyOtp
      phone={phone}
      challengeId={challengeId}
      phoneNumberMasked={phoneNumberMasked}
      expiresInSeconds={expiresInSeconds}
      resendInSeconds={resendInSeconds}
      codeLength={codeLength}
    />
  );
};

export default VerifyOtpPage;
