import VerifyOtp from "@/src/feature/auth/screens/VerifyOtp";
import { useLocalSearchParams } from "expo-router";

const VerifyOtpPage = () => {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  return <VerifyOtp phone={phone} />;
};

export default VerifyOtpPage;
