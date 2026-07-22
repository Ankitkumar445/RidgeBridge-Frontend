import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// expo-secure-store has no web implementation, so we fall back to
// AsyncStorage (localStorage-backed) on web and use the OS keychain
// / keystore on native for anything auth-related.
const isWeb = Platform.OS === "web";

export const storage = {
  async getItem(key: string): Promise<string | null> {
    return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) await AsyncStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) await AsyncStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};

export const STORAGE_KEYS = {
  token: "ridebridge_token",
  user: "ridebridge_user",
};
