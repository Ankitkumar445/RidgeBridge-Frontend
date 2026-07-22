import axios from "axios";
import Constants from "expo-constants";
import { storage, STORAGE_KEYS } from "../utils/storage";

// EXPO_PUBLIC_ vars are inlined at build time; fall back to localhost for dev.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as any)?.apiUrl ||
  "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes backend's { error: string } shape into a plain Error so every
// screen can just do `catch (e) { setError(e.message) }`.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong. Please try again.";
    const wrapped = new Error(message) as Error & { status?: number };
    wrapped.status = err?.response?.status;
    return Promise.reject(wrapped);
  }
);

export { API_URL };
