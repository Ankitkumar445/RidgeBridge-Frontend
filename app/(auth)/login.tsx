import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorBanner } from "../../src/components/Feedback";
import { useAuth } from "../../src/context/AuthContext";
import { colors, gradients, type } from "../../src/theme/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
      router.replace("/(app)/home");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <View style={styles.markRow}>
          <View style={styles.mark}>
            <Ionicons name="git-network-outline" size={22} color={colors.coral} />
          </View>
          <Text style={styles.brand}>RideBridge</Text>
        </View>
        <Text style={styles.headline}>Welcome back on the road.</Text>
        <Text style={styles.sub}>Escrow-secured intercity rides — book, drive, arrive.</Text>
      </LinearGradient>

      <ScreenContainer contentStyle={{ paddingTop: 24 }}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        <Input
          label="Mobile number"
          leftAdornment="+91"
          placeholder="98765 43210"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.showToggle}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={15} color={colors.textMuted} />
          <Text style={styles.showToggleText}>{showPassword ? "Hide" : "Show"} password</Text>
        </Pressable>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={{ alignSelf: "flex-end" }}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </Link>

        <Button label="Log in" onPress={onSubmit} loading={loading} style={{ marginTop: 4 }} />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to RideBridge?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.link}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 72, paddingHorizontal: 20, paddingBottom: 30, gap: 8 },
  markRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.coralDim,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { ...type.h2, color: colors.textPrimary },
  headline: { ...type.display, color: colors.textPrimary, marginTop: 8 },
  sub: { ...type.body, color: colors.textSecondary },
  showToggle: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: -6 },
  showToggleText: { ...type.small, color: colors.textMuted },
  link: { ...type.small, color: colors.coral, fontWeight: "700" },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  footerText: { ...type.small, color: colors.textMuted },
});
