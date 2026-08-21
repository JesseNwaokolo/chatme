import * as Device from "expo-device";
import { Platform } from "react-native";
import { DeviceInfo } from "../api/types";

export function getDeviceInfo(): DeviceInfo {
  return {
    name: Device.deviceName ?? "Unknown device",
    platform: Platform.OS,
  };
}
