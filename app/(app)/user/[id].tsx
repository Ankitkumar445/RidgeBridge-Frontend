import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../../src/components/GradientHeader";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { Card } from "../../../src/components/Card";
import { EmptyState, LoadingBlock } from "../../../src/components/Feedback";
import { ratingsApi } from "../../../src/api/misc";
import { Rating } from "../../../src/types";
import { colors, type } from "../../../src/theme/theme";

export default function UserRatingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ratings, setRatings] = useState<Rating[] | null>(null);

  useEffect(() => {
    ratingsApi.forUser(id).then(setRatings).catch(() => setRatings([]));
  }, [id]);

  const avg = ratings?.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader
        eyebrow="Reviews"
        title={avg != null ? `${avg.toFixed(1)} ★ rating` : "Reviews"}
        right={
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ScreenContainer>
        {ratings === null ? (
          <LoadingBlock />
        ) : ratings.length === 0 ? (
          <EmptyState icon="star-outline" title="No reviews yet" />
        ) : (
          ratings.map((r) => (
            <Card key={r.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.name}>{r.fromUser?.name || "Rider"}</Text>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons key={n} name={n <= r.score ? "star" : "star-outline"} size={12} color={colors.amber} />
                  ))}
                </View>
              </View>
              {r.comment ? <Text style={styles.comment}>{r.comment}</Text> : null}
            </Card>
          ))
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...type.bodyMed, color: colors.textPrimary },
  comment: { ...type.small, color: colors.textSecondary, marginTop: 6 },
});
