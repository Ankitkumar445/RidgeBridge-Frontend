import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorBanner, SuccessBanner } from "../../src/components/Feedback";
import { authApi } from "../../src/api/auth";
import { colors, gradients, type } from "../../src/theme/theme";

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
    setSending(true);
    setError(null);
    try {
      const r = await authApi.sendVerifyOtp();
      setInfo(r.message || "OTP sent to your email and phone");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code");
    setLoading(true);
    try {
      await authApi.verifyOtp(otp);
      router.replace("/(app)/home");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <View style={styles.mark}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.teal} />
        </View>
        <Text style={styles.headline}>Verify your account</Text>
        <Text style={styles.sub}>We sent a 6-digit code to your email and phone. It's valid for 10 minutes.</Text>
      </LinearGradient>

      <ScreenContainer contentStyle={{ paddingTop: 24 }}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        {info && !error ? <SuccessBanner message={info} /> : null}

        <Input
          label="Verification code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ""))}
          style={{ letterSpacing: 8, fontSize: 20, textAlign: "center" }}
        />

        <Button label="Verify" onPress={onSubmit} loading={loading} variant="teal" />
        <Button label="Resend code" onPress={sendOtp} loading={sending} variant="ghost" />
        <Button label="Skip for now" onPress={() => router.replace("/(app)/home")} variant="outline" />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 72, paddingHorizontal: 20, paddingBottom: 30, gap: 8 },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.tealDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  headline: { ...type.display, color: colors.textPrimary },
  sub: { ...type.body, color: colors.textSecondary },
});
