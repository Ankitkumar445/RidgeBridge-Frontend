import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../../src/components/GradientHeader";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { Card } from "../../../src/components/Card";
import { Input } from "../../../src/components/Input";
import { Button } from "../../../src/components/Button";
import { StatusPill } from "../../../src/components/StatusPill";
import { EmptyState, ErrorBanner, LoadingBlock } from "../../../src/components/Feedback";
import { bookingsApi } from "../../../src/api/bookings";
import { useAuth } from "../../../src/context/AuthContext";
import { MyBooking } from "../../../src/types";
import { colors, type } from "../../../src/theme/theme";

// This screen now pulls from GET /bookings/mine — a proper server-side list
// scoped to the logged-in user (as rider OR driver), so bookings show up
// correctly regardless of which device they were made on. The "track by ID"
// box below is kept as a manual fallback/override (e.g. a driver who was
// given a booking ID directly by a rider before it synced), not the primary
// path anymore.

export default function BookingsListScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [showTrack, setShowTrack] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.mine();
      setEntries(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onTrack = async () => {
    setError(null);
    const id = trackId.trim();
    if (!id) return;
    setTracking(true);
    try {
      // Just confirm the booking exists / is accessible, then jump straight
      // to its detail screen — that screen is the real source of truth for
      // a single booking's live status.
      await bookingsApi.getContact(id).catch((e: any) => {
        if (!/payment required/i.test(e.message)) throw e;
      });
      setTrackId("");
      setShowTrack(false);
      router.push(`/(app)/bookings/${id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTracking(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader eyebrow="Your trips" title="Bookings" subtitle="Everything you've booked or are driving." />
      <ScreenContainer refreshing={loading} onRefresh={load}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        <Pressable style={styles.trackToggle} onPress={() => setShowTrack((s) => !s)}>
          <Ionicons name="key-outline" size={16} color={colors.teal} />
          <Text style={styles.trackToggleText}>Open a booking by ID</Text>
          <Ionicons name={showTrack ? "chevron-up" : "chevron-down"} size={14} color={colors.teal} />
        </Pressable>

        {showTrack && (
          <Card style={{ gap: 10 }}>
            <Text style={styles.trackHint}>
              Have a booking ID directly (e.g. shared by your rider or driver)? Open it here.
            </Text>
            <Input placeholder="Booking ID" value={trackId} onChangeText={setTrackId} autoCapitalize="none" />
            <Button label="Open booking" onPress={onTrack} loading={tracking} variant="teal" />
          </Card>
        )}

        {loading ? (
          <LoadingBlock label="Loading bookings…" />
        ) : entries.length === 0 ? (
          <EmptyState
            icon="ticket-outline"
            title="No bookings yet"
            subtitle="Book a ride from Explore, or post a trip if you're driving."
          />
        ) : (
          entries.map((b) => (
            <Pressable key={b.id} onPress={() => router.push(`/(app)/bookings/${b.id}`)}>
              <Card>
                <View style={styles.row}>
                  <Text style={styles.route}>
                    {b.listing.fromCity} → {b.listing.toCity}
                  </Text>
                  <StatusPill status={b.status} small />
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>₹{b.amount}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{b.seatsBooked} seat(s)</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{b.role === "RIDER" ? "As rider" : "As driver"}</Text>
                </View>
                <Text style={styles.metaText}>
                  {b.role === "RIDER" ? `Driver: ${b.listing.driver.name}` : `Rider: ${b.rider.name}`}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  trackToggle: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  trackToggleText: { ...type.small, color: colors.teal, fontWeight: "700" },
  trackHint: { ...type.small, color: colors.textMuted },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  route: { ...type.h2, color: colors.textPrimary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, marginBottom: 4 },
  metaText: { ...type.small, color: colors.textSecondary },
  metaDot: { color: colors.textMuted },
});
