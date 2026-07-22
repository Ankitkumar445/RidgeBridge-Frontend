import { api } from "./client";
import { AuthUser } from "../types";

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  register: (name: string, phone: string, password: string, email?: string) =>
    api
      .post<AuthResponse>("/auth/register", { name, phone, password, email: email || undefined })
      .then((r) => r.data),

  login: (phone: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { phone, password }).then((r) => r.data),

  sendVerifyOtp: () => api.post("/auth/send-verify-otp").then((r) => r.data),

  verifyOtp: (otp: string) => api.post("/auth/verify-otp", { otp }).then((r) => r.data),

  forgotPassword: (phone: string) => api.post("/auth/forgot-password", { phone }).then((r) => r.data),

  resetPassword: (phone: string, otp: string, newPassword: string) =>
    api.post("/auth/reset-password", { phone, otp, newPassword }).then((r) => r.data),
};
