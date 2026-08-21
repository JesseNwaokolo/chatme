import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/src/api/config";
import axios from "axios";

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
};

export async function uploadAvatar(localUri: string): Promise<string> {
  const extension = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeType = MIME_TYPES[extension] ?? "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    type: mimeType,
    name: `avatar-${Date.now()}.${extension}`,
  } as unknown as Blob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const { data } = await axios.post<{ secure_url: string }>(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.secure_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ?? "Couldn't upload photo",
      );
    }
    throw error;
  }
}
