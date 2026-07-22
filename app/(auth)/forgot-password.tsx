import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorBanner } from "../../src/components/Feedback";
import { authApi } from "../../src/api/auth";
import { colors, gradients, type } from "../../src/theme/theme";

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number");
    setLoading(true);
    try {
      await authApi.forgotPassword(phone);
      router.push({ pathname: "/(auth)/reset-password", params: { phone } });
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
        <Text style={styles.headline}>Reset password</Text>
        <Text style={styles.sub}>We'll send a one-time code to your registered mobile number and email.</Text>
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
        <Button label="Send code" onPress={onSubmit} loading={loading} />
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
