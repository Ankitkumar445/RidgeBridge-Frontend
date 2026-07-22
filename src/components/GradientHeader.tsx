import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradients, type } from "../theme/theme";

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  variant?: "hero" | "admin";
  compact?: boolean;
}

export function GradientHeader({ title, subtitle, eyebrow, right, variant = "hero", compact }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={variant === "admin" ? gradients.admin : gradients.hero}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + (compact ? 10 : 18) }]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  row: { flexDirection: "row", alignItems: "center" },
  eyebrow: { ...type.tiny, color: colors.coral, textTransform: "uppercase", marginBottom: 4 },
  title: { ...type.display, color: colors.textPrimary },
  subtitle: { ...type.body, color: colors.textSecondary, marginTop: 4 },
});
