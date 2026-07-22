import React, { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../../src/components/GradientHeader";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { Card, Divider } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { Badge } from "../../../src/components/StatusPill";
import { ErrorBanner, LoadingBlock } from "../../../src/components/Feedback";
import { useRazorpayCheckout } from "../../../src/components/RazorpayCheckout";
import { bookingsApi } from "../../../src/api/bookings";
import { ratingsApi } from "../../../src/api/misc";
import { useAuth } from "../../../src/context/AuthContext";
import { upsertLocalBooking } from "../../../src/utils/bookingsStore";
import { Listing, Rating } from "../../../src/types";
import { colors, radius, type } from "../../../src/theme/theme";

export default function ListingDetailScreen() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const { user } = useAuth();
  const { open, CheckoutModal } = useRazorpayCheckout();

  const listing: Listing | null = useMemo(() => (data ? JSON.parse(data) : null), [data]);
  const [seats, setSeats] = useState(1);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (listing?.driver?.id) {
      ratingsApi.forUser(listing.driver.id).then(setRatings).catch(() => {});
    }
  }, [listing?.driver?.id]);

  if (!listing) {
    return (
      <ScreenContainer>
        <ErrorBanner message="Listing details unavailable — go back and reopen it from the search results." />
      </ScreenContainer>
    );
  }

  const departure = new Date(listing.departureTime);
  const isOwnListing = listing.driver?.id === user?.id;
  const total = Number(listing.pricePerSeat) * seats;

  const onBook = async () => {
    setError(null);
    setBooking(true);
    try {
      const { booking: b, razorpayOrderId, amount, keyId } = await bookingsApi.initiate(listing.id, seats);

      if (user?.id) {
        await upsertLocalBooking(user.id, {
          id: b.id,
          status: b.status,
          fromCity: listing.fromCity,
          toCity: listing.toCity,
          departureTime: listing.departureTime,
          amount,
          seatsBooked: seats,
          role: "RIDER",
          createdAt: new Date().toISOString(),
          razorpayOrderId,
          razorpayKeyId: keyId,
        });
      }

      let payment;
      try {
        payment = await open({
          key: keyId,
          amount: Math.round(amount * 100),
          currency: "INR",
          name: "RideBridge",
          description: `${listing.fromCity} → ${listing.toCity}`,
          order_id: razorpayOrderId,
          prefill: { name: user?.name, contact: user?.phone },
          theme: { color: "#FF6B4A" },
        });
      } catch (payErr: any) {
        // Payment was cancelled or failed client-side — booking stays PENDING_PAYMENT
        // and the rider can retry from their bookings list.
        setError(payErr.message || "Payment was not completed");
        router.replace(`/(app)/bookings/${b.id}`);
        return;
      }

      const confirmed = await bookingsApi.confirmPayment(
        b.id,
        razorpayOrderId,
        payment.razorpay_payment_id,
        payment.razorpay_signature
      );
      if (user?.id) {
        await upsertLocalBooking(user.id, {
          id: b.id,
          status: confirmed.status,
          fromCity: listing.fromCity,
          toCity: listing.toCity,
          departureTime: listing.departureTime,
          amount,
          seatsBooked: seats,
          role: "RIDER",
          createdAt: new Date().toISOString(),
        });
      }
      router.replace(`/(app)/bookings/${b.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBooking(false);
    }
  };

  const openMap = (lat?: number | null, lng?: number | null, label?: string) => {
    if (lat == null || lng == null) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader
        eyebrow="Trip details"
        title={`${listing.fromCity} → ${listing.toCity}`}
        subtitle={departure.toLocaleString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
        right={
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScreenContainer>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        <Card>
          <View style={styles.routeVisual}>
            <View style={styles.routeCol}>
              <View style={[styles.routeDot, { backgroundColor: colors.teal }]} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: colors.coral }]} />
            </View>
            <View style={{ flex: 1, gap: 22 }}>
              <Pressable onPress={() => openMap(listing.fromLat, listing.fromLng)}>
                <Text style={styles.routeCity}>{listing.fromCity}</Text>
                <Text style={styles.routeHint}>Pickup point</Text>
              </Pressable>
              <Pressable onPress={() => openMap(listing.toLat, listing.toLng)}>
                <Text style={styles.routeCity}>{listing.toCity}</Text>
                <Text style={styles.routeHint}>Drop point</Text>
              </Pressable>
            </View>
          </View>

          <Divider />

          <View style={styles.metaGrid}>
            <MetaItem icon="car-sport-outline" label="Vehicle" value={listing.vehicleType} />
            <MetaItem icon="people-outline" label="Seats left" value={String(listing.seatsAvailable ?? "—")} />
            <MetaItem icon="pricetag-outline" label="Per seat" value={`₹${listing.pricePerSeat}`} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Driver</Text>
          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{listing.driver?.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.driverName}>{listing.driver?.name}</Text>
                {listing.driver?.isVerified && <Ionicons name="checkmark-circle" size={15} color={colors.teal} />}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Ionicons name="star" size={13} color={colors.amber} />
                <Text style={styles.driverRating}>
                  {listing.driver?.rating?.toFixed(1)} · {ratings.length} review{ratings.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
            <Badge label="KYC verified" tone="teal" />
          </View>

          {ratings.slice(0, 3).map((r) => (
            <View key={r.id} style={styles.reviewRow}>
              <Ionicons name="star" size={12} color={colors.amber} />
              <Text style={styles.reviewText} numberOfLines={2}>
                <Text style={{ fontWeight: "700", color: colors.textSecondary }}>{r.fromUser?.name || "Rider"}: </Text>
                {r.comment || "Great ride."}
              </Text>
            </View>
          ))}
        </Card>

        {!isOwnListing && (
          <Card>
            <Text style={styles.sectionTitle}>Seats to book</Text>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setSeats((s) => Math.max(1, s - 1))}
                disabled={seats <= 1}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.stepperValue}>{seats}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setSeats((s) => Math.min(listing.seatsAvailable || 8, s + 1))}
                disabled={seats >= (listing.seatsAvailable || 8)}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Divider />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total payable</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
            <Text style={styles.escrowNote}>
              Held securely until your ride is confirmed complete. Driver contact unlocks right after payment.
            </Text>
          </Card>
        )}
      </ScreenContainer>

      {!isOwnListing && (
        <View style={styles.footer}>
          <Button label={`Book · ₹${total}`} onPress={onBook} loading={booking} />
        </View>
      )}
      {CheckoutModal}
    </View>
  );
}

function MetaItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
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
  routeVisual: { flexDirection: "row", gap: 14 },
  routeCol: { alignItems: "center", width: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { flex: 1, width: 2, backgroundColor: colors.surfaceBorder, marginVertical: 4 },
  routeCity: { ...type.h2, color: colors.textPrimary },
  routeHint: { ...type.small, color: colors.textMuted, marginTop: 2 },
  metaGrid: { flexDirection: "row", justifyContent: "space-between" },
  metaItem: { alignItems: "center", gap: 4, flex: 1 },
  metaValue: { ...type.bodyMed, color: colors.textPrimary },
  metaLabel: { ...type.tiny, color: colors.textMuted },
  sectionTitle: { ...type.h2, color: colors.textPrimary, marginBottom: 12 },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.coralDim,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...type.h2, color: colors.coral },
  driverName: { ...type.bodyMed, color: colors.textPrimary },
  driverRating: { ...type.small, color: colors.textMuted },
  reviewRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 12 },
  reviewText: { ...type.small, color: colors.textMuted, flex: 1 },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 22 },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { ...type.display, color: colors.textPrimary, minWidth: 32, textAlign: "center" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { ...type.body, color: colors.textSecondary },
  totalValue: { ...type.h1, color: colors.coral },
  escrowNote: { ...type.small, color: colors.textMuted, marginTop: 8 },
  footer: {
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.bgElevated,
  },
});
