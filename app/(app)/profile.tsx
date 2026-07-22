import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../src/components/GradientHeader";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card, Divider } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Badge } from "../../src/components/StatusPill";
import { EmptyState } from "../../src/components/Feedback";
import { ratingsApi } from "../../src/api/misc";
import { useAuth } from "../../src/context/AuthContext";
import { Rating } from "../../src/types";
import { colors, type } from "../../src/theme/theme";

const ROLE_LABEL: Record<string, string> = {
  RIDER: "Rider",
  DRIVER: "Driver",
  BOTH: "Rider & Driver",
  ADMIN: "Administrator",
};

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    if (user?.id) ratingsApi.forUser(user.id).then(setRatings).catch(() => {});
  }, [user?.id]);

  const avg = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader eyebrow="Account" title="Profile" subtitle="Manage your identity and verification." />
      <ScreenContainer>
        <Card style={{ alignItems: "center", gap: 8 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>+91 {user?.phone}</Text>
          <Badge label={ROLE_LABEL[profile?.role || "RIDER"]} tone="coral" />

          {avg != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.amber} />
              <Text style={styles.ratingText}>
                {avg.toFixed(1)} · {ratings.length} review{ratings.length === 1 ? "" : "s"}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Pressable style={styles.linkRow} onPress={() => router.push("/(app)/kyc")}>
            <View style={styles.linkIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Identity verification</Text>
              <Text style={styles.linkSubtitle}>
                {profile?.fullyVerifiedAsDriver
                  ? "Fully verified as driver"
                  : profile?.fullyVerifiedAsRider
                  ? "Verified as rider"
                  : "Not started"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Recent reviews</Text>
          {ratings.length === 0 ? (
            <EmptyState icon="star-outline" title="No reviews yet" subtitle="Reviews appear after your first completed ride." />
          ) : (
            ratings.slice(0, 8).map((r) => (
              <View key={r.id} style={styles.reviewRow}>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons key={n} name={n <= r.score ? "star" : "star-outline"} size={12} color={colors.amber} />
                  ))}
                </View>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </Card>

        <Divider />
        <Button
          label="Log out"
          variant="outline"
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.coralDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { ...type.display, color: colors.coral },
  name: { ...type.h1, color: colors.textPrimary },
  phone: { ...type.small, color: colors.textMuted },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  ratingText: { ...type.small, color: colors.textSecondary },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.tealDim,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTitle: { ...type.bodyMed, color: colors.textPrimary },
  linkSubtitle: { ...type.small, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { ...type.h2, color: colors.textPrimary, marginBottom: 10 },
  reviewRow: { gap: 4, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  reviewComment: { ...type.small, color: colors.textSecondary },
});
