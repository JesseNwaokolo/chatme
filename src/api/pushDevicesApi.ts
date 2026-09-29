import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export interface PushDevice {
  installationId: string;
  platform: "ios" | "android";
  registeredAt: string;
}

/** `token` must be an Expo push token (ExponentPushToken[...]). */
export const registerPushDevice = (
  installationId: string,
  body: { platform: "ios" | "android"; token: string },
) =>
  apiClient
    .put<PushDevice>(endpoints.push.device(installationId), body)
    .then((res) => res.data);

export const unregisterPushDevice = (installationId: string) =>
  apiClient.delete<void>(endpoints.push.device(installationId)).then(() => undefined);

export const getHealth = () => apiClient.get(endpoints.health).then((res) => res.data);
