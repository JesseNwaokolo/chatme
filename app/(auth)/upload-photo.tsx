import UploadPhoto from "@/src/feature/auth/screens/UploadPhoto";
import { useLocalSearchParams } from "expo-router";

const UploadPhotoPage = () => {
  const { displayName } = useLocalSearchParams<{ displayName: string }>();

  return <UploadPhoto displayName={displayName} />;
};

export default UploadPhotoPage;
