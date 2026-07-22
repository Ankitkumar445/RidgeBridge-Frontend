import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorBanner, SuccessBanner } from "../../src/components/Feedback";
import { authApi } from "../../src/api/auth";
import { colors, gradients, type } from "../../src/theme/theme";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ phone?: string }>();
  const [phone, setPhone] = useState(params.phone || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");
    setLoading(true);
    try {
      await authApi.resetPassword(phone, otp, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/(auth)/login"), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headline}>Enter new password</Text>
        <Text style={styles.sub}>Check your email and SMS for the 6-digit reset code.</Text>
      </LinearGradient>

      <ScreenContainer contentStyle={{ paddingTop: 24 }}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        {success ? <SuccessBanner message="Password reset — redirecting to login" /> : null}

        <Input
          label="Mobile number"
          leftAdornment="+91"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
        />
        <Input
          label="Reset code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ""))}
        />
        <Input
          label="New password"
          placeholder="At least 8 characters"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
        <Button label="Reset password" onPress={onSubmit} loading={loading} />
      </ScreenContainer>
    </View>
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
});
