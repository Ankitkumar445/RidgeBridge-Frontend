import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, type } from "../theme/theme";

export function EmptyState({
  icon = "sparkles-outline",
  title,
  subtitle,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function LoadingBlock({ label }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.coral} />
      {label ? <Text style={styles.loadingLabel}>{label}</Text> : null}
    </View>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <View style={styles.banner}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.bannerText}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <View style={[styles.banner, { backgroundColor: colors.tealDim, borderColor: "#1E4B42" }]}>
      <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
      <Text style={[styles.bannerText, { color: colors.teal }]}>{message}</Text>
    </View>
  );
}

export function RatingStars({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} disabled={!onChange} onPress={() => onChange?.(n)} hitSlop={6}>
          <Ionicons
            name={n <= value ? "star" : "star-outline"}
            size={size}
            color={n <= value ? colors.amber : colors.textMuted}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 10 },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { ...type.h2, color: colors.textPrimary },
  emptySubtitle: { ...type.body, color: colors.textMuted, textAlign: "center", maxWidth: 280 },
  loading: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 },
  loadingLabel: { ...type.small, color: colors.textMuted },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: "#4B1F2C",
    borderRadius: radius.md,
    padding: 12,
  },
  bannerText: { ...type.small, color: colors.danger, flex: 1 },
});
