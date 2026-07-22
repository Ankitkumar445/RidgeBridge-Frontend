import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { colors, gradients, type } from "../src/theme/theme";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LinearGradient colors={gradients.hero} style={styles.splash}>
        <View style={styles.mark}>
          <View style={styles.markRing} />
          <View style={styles.markDot} />
        </View>
        <Text style={styles.brand}>RideBridge</Text>
        <Text style={styles.tagline}>Intercity rides, escrow-secured</Text>
        <ActivityIndicator color={colors.coral} style={{ marginTop: 28 }} />
      </LinearGradient>
    );
  }

  return <Redirect href={user ? "/(app)/home" : "/(auth)/login"} />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  mark: { width: 64, height: 64, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  markRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.coral,
  },
  markDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.coral },
  brand: { ...type.display, color: colors.textPrimary },
  tagline: { ...type.small, color: colors.textSecondary },
});
