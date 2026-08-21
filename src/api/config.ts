export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

if (__DEV__ && !API_BASE_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set");
}

export const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

if (__DEV__ && (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET)) {
  console.warn("Cloudinary env vars are not set");
}
