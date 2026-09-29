import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV({ id: "query-cache" });

export const queryCacheStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkv.set(key, value),
  removeItem: (key: string) => mmkv.remove(key),
};
