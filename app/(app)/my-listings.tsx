import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../src/components/GradientHeader";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { StatusPill } from "../../src/components/StatusPill";
import { EmptyState, ErrorBanner, LoadingBlock } from "../../src/components/Feedback";
import { listingsApi } from "../../src/api/listings";
import { useAuth } from "../../src/context/AuthContext";
import { Listing } from "../../src/types";
import { colors, type } from "../../src/theme/theme";

export default function MyListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await listingsApi.search({});
      setListings(all.filter((l) => l.driver?.id === user?.id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const doCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await listingsApi.cancel(id);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCancellingId(null);
    }
  };

  const confirmCancel = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Cancel this ride? Any paid riders will be refunded automatically.")) doCancel(id);
      return;
    }
    Alert.alert("Cancel this ride?", "Any paid riders will be refunded automatically.", [
      { text: "Keep it", style: "cancel" },
      { text: "Cancel ride", style: "destructive", onPress: () => doCancel(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader eyebrow="Driver" title="My trips" subtitle="Rides you've posted." />
      <ScreenContainer refreshing={loading} onRefresh={load}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        <Pressable style={styles.postBanner} onPress={() => router.push("/(app)/post-ride")}>
          <Ionicons name="add-circle" size={18} color={colors.coral} />
          <Text style={styles.postBannerText}>Post a new ride</Text>
        </Pressable>

        {loading ? (
          <LoadingBlock label="Loading your trips…" />
        ) : listings.length === 0 ? (
          <EmptyState icon="car-outline" title="No active trips" subtitle="Post a ride to start earning as a driver." />
        ) : (
          listings.map((l) => {
            const departure = new Date(l.departureTime);
            return (
              <Card key={l.id}>
                <View style={styles.row}>
                  <Text style={styles.route}>
                    {l.fromCity} → {l.toCity}
                  </Text>
                  <StatusPill status={l.status || "ACTIVE"} small />
                </View>
                <Text style={styles.time}>
                  {departure.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>₹{l.pricePerSeat} / seat</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{l.seatsAvailable} seats left</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{l.vehicleType}</Text>
                </View>
                {l.status === "ACTIVE" && (
                  <Button
                    label="Cancel ride"
                    variant="danger"
                    onPress={() => confirmCancel(l.id)}
                    loading={cancellingId === l.id}
                    style={{ marginTop: 12 }}
                  />
                )}
              </Card>
            );
          })
        )}

        <Text style={styles.footnote}>
          Only your active listings are shown — the backend's public search endpoint doesn't expose a "my
          listings" filter for other statuses yet.
        </Text>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  postBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.coralDim,
    padding: 14,
    borderRadius: 16,
  },
  postBannerText: { ...type.bodyMed, color: colors.coral },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  route: { ...type.h2, color: colors.textPrimary },
  time: { ...type.small, color: colors.textMuted, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  metaText: { ...type.small, color: colors.textSecondary },
  metaDot: { color: colors.textMuted },
  footnote: { ...type.small, color: colors.textMuted, textAlign: "center", paddingTop: 4 },
});
