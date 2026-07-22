import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, STATUS_META, type } from "../theme/theme";

export function StatusPill({ status, small }: { status: string; small?: boolean }) {
  const meta = STATUS_META[status] || { label: status, color: colors.textSecondary, bg: colors.surfaceAlt };
  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }, small && { paddingVertical: 4, paddingHorizontal: 8 }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.label, { color: meta.color }, small && { fontSize: 10.5 }]}>{meta.label}</Text>
    </View>
  );
}

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "coral" | "teal" | "danger" }) {
  const map = {
    neutral: { bg: colors.surfaceAlt, color: colors.textSecondary },
    coral: { bg: colors.coralDim, color: colors.coral },
    teal: { bg: colors.tealDim, color: colors.teal },
    danger: { bg: colors.dangerDim, color: colors.danger },
  } as const;
  const c = map[tone];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...type.tiny, textTransform: "uppercase" },
});
