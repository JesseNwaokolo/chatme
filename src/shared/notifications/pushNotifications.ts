import { registerPushDevice, unregisterPushDevice } from "@/src/api/pushDevicesApi";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const INSTALLATION_ID_KEY = "push-installation-id";
const ANDROID_CHANNEL_ID = "messages";

/** In the foreground the in-app banner handles messages, so the OS banner stays hidden. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function getInstallationId() {
  const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
  if (existing) return existing;

  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, created);
  return created;
}

export async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Messages",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  const status =
    existing.status === "granted"
      ? existing.status
      : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushDevice(await getInstallationId(), {
    platform: Platform.OS === "ios" ? "ios" : "android",
    token,
  });
}

/** Must run while the user is still authenticated. */
export async function unregisterFromPushNotifications() {
  try {
    const installationId = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
    if (installationId) await unregisterPushDevice(installationId);
  } catch {
    // Best effort: logout must not fail because push cleanup did.
  }
}
