export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

if (__DEV__ && !API_BASE_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set");
}
