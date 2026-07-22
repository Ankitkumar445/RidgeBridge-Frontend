import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorBanner } from "../../src/components/Feedback";
import { useAuth } from "../../src/context/AuthContext";
import { colors, gradients, type } from "../../src/theme/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError("Enter your full name");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email or leave it blank");
    if (password.length < 8) return setError("Password must be at least 8 characters");

    setLoading(true);
    try {
      await register(name.trim(), phone, password, email.trim() || undefined);
      router.replace("/(auth)/verify-otp");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headline}>Create your account</Text>
        <Text style={styles.sub}>Ride, or post trips as a verified driver — one account, both roles.</Text>
      </LinearGradient>

      <ScreenContainer contentStyle={{ paddingTop: 24 }}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        <Input label="Full name" placeholder="Aditi Sharma" value={name} onChangeText={setName} />
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
          label="Email (optional)"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        <Button label="Create account" onPress={onSubmit} loading={loading} style={{ marginTop: 4 }} />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.link}>Log in</Text>
            </Pressable>
          </Link>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 26, gap: 8 },
  back: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headline: { ...type.display, color: colors.textPrimary },
  sub: { ...type.body, color: colors.textSecondary },
  link: { ...type.small, color: colors.coral, fontWeight: "700" },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  footerText: { ...type.small, color: colors.textMuted },
});
