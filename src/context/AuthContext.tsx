import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { authApi } from "../api/auth";
import { verificationApi } from "../api/misc";
import { AuthUser, FullUserProfile } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  profile: FullUserProfile | null;
  isLoading: boolean;
  isVerifiedAccount: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAccountVerified: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifiedAccount, setIsVerifiedAccount] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await verificationApi.status();
      setProfile(p);
    } catch {
      // not fatal — profile is supplementary
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(STORAGE_KEYS.token);
        const rawUser = await storage.getItem(STORAGE_KEYS.user);
        if (token && rawUser) {
          setUser(JSON.parse(rawUser));
          await refreshProfile();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshProfile]);

  const persistSession = async (u: AuthUser, token: string) => {
    await storage.setItem(STORAGE_KEYS.token, token);
    await storage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
    setUser(u);
    await refreshProfile();
  };

  const login = async (phone: string, password: string) => {
    const { user: u, token } = await authApi.login(phone, password);
    await persistSession(u, token);
  };

  const register = async (name: string, phone: string, password: string, email?: string) => {
    const { user: u, token } = await authApi.register(name, phone, password, email);
    await persistSession(u, token);
  };

  const logout = async () => {
    await storage.removeItem(STORAGE_KEYS.token);
    await storage.removeItem(STORAGE_KEYS.user);
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      isVerifiedAccount,
      login,
      register,
      logout,
      refreshProfile,
      setAccountVerified: setIsVerifiedAccount,
    }),
    [user, profile, isLoading, isVerifiedAccount, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
