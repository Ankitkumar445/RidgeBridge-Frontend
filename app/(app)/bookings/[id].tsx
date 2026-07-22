import React, { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { GradientHeader } from "../../../src/components/GradientHeader";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { Card, Divider } from "../../../src/components/Card";
import { Input } from "../../../src/components/Input";
import { Button } from "../../../src/components/Button";
import { StatusPill } from "../../../src/components/StatusPill";
import { ErrorBanner, LoadingBlock, RatingStars, SuccessBanner } from "../../../src/components/Feedback";
import { useRazorpayCheckout } from "../../../src/components/RazorpayCheckout";
import { bookingsApi } from "../../../src/api/bookings";
import { ratingsApi } from "../../../src/api/misc";
import { useAuth } from "../../../src/context/AuthContext";
import { getLocalBookings, upsertLocalBooking, LocalBookingEntry } from "../../../src/utils/bookingsStore";
import { BookingContact, BookingStatus } from "../../../src/types";
import { colors, radius, type } from "../../../src/theme/theme";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { open, CheckoutModal } = useRazorpayCheckout();

  const [contact, setContact] = useState<BookingContact | null>(null);
  const [local, setLocal] = useState<LocalBookingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPaymentRequired(false);
    setNotFound(false);
    try {
      const c = await bookingsApi.getContact(id);
      setContact(c);
    } catch (e: any) {
      if (e.status === 402) setPaymentRequired(true);
      else if (e.status === 404) setNotFound(true);
      else setError(e.message);
    } finally {
      setLoading(false);
    }
    if (user?.id) {
      const all = await getLocalBookings(user.id);
      setLocal(all.find((b) => b.id === id) || null);
    }
  }, [id, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const role: "RIDER" | "DRIVER" | null = contact
    ? contact.riderContact === user?.phone
      ? "RIDER"
      : contact.driverContact === user?.phone
      ? "DRIVER"
      : null
    : local?.role || null;

  const retryPayment = async () => {
    if (!local?.razorpayOrderId || !local?.razorpayKeyId) {
      setError("This booking's payment session has expired. Book again from the listing.");
      return;
    }
    setError(null);
    try {
      const payment = await open({
        key: local.razorpayKeyId,
        amount: Math.round(local.amount * 100),
        currency: "INR",
        name: "RideBridge",
        description: `${local.fromCity} → ${local.toCity}`,
        order_id: local.razorpayOrderId,
        prefill: { name: user?.name, contact: user?.phone },
        theme: { color: "#FF6B4A" },
      });
      const confirmed = await bookingsApi.confirmPayment(
        id,
        local.razorpayOrderId,
        payment.razorpay_payment_id,
        payment.razorpay_signature
      );
      if (user?.id) await upsertLocalBooking(user.id, { ...local, status: confirmed.status });
      await load();
    } catch (e: any) {
      setError(e.message || "Payment was not completed");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <GradientHeader eyebrow="Booking" title="Loading…" />
        <LoadingBlock label="Fetching booking details…" />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <GradientHeader eyebrow="Booking" title="Not found" />
        <ScreenContainer>
          <ErrorBanner message="This booking doesn't exist or you don't have access to it." />
        </ScreenContainer>
      </View>
    );
  }

  if (paymentRequired) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <GradientHeader
          eyebrow="Booking"
          title={local ? `${local.fromCity} → ${local.toCity}` : "Payment pending"}
          right={<StatusPill status="PENDING_PAYMENT" small />}
        />
        <ScreenContainer>
          {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
          <Card>
            <Text style={styles.sectionTitle}>Complete your payment</Text>
            <Text style={styles.bodyText}>
              Your seat is reserved, but the driver's contact stays locked until payment is confirmed.
            </Text>
            {local?.amount ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount due</Text>
                <Text style={styles.totalValue}>₹{local.amount}</Text>
              </View>
            ) : null}
            <Button label="Pay now" onPress={retryPayment} style={{ marginTop: 12 }} />
          </Card>
        </ScreenContainer>
        {CheckoutModal}
      </View>
    );
  }

  if (!contact) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <GradientHeader eyebrow="Booking" title="Something went wrong" />
        <ScreenContainer>
          {error ? <ErrorBanner message={error} /> : null}
          <Button label="Retry" onPress={load} />
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader
        eyebrow={role === "DRIVER" ? "Driving" : "Riding"}
        title={local ? `${local.fromCity} → ${local.toCity}` : "Ride"}
        right={<StatusPill status={contact.status} small />}
      />
      <ScreenContainer onRefresh={load} refreshing={false}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        <ContactCard contact={contact} role={role} />

        {contact.status === "PAID_HELD" && (
          <StartRideCard bookingId={id} role={role} contact={contact} onChanged={load} />
        )}

        {contact.status === "IN_PROGRESS" && (
          <LiveRideCard bookingId={id} role={role} contact={contact} onChanged={load} setError={setError} />
        )}

        {(contact.status === "PENDING_PAYMENT" || contact.status === "PAID_HELD") && role === "RIDER" && (
          <CancelCard bookingId={id} onChanged={load} setError={setError} />
        )}

        {contact.status === "COMPLETED" && <RateCard bookingId={id} />}

        {!["COMPLETED", "CANCELLED_BY_RIDER", "CANCELLED_BY_DRIVER", "DISPUTED"].includes(contact.status) && (
          <DisputeCard bookingId={id} onChanged={load} setError={setError} />
        )}
      </ScreenContainer>
      {CheckoutModal}
    </View>
  );
}

function ContactCard({ contact, role }: { contact: BookingContact; role: "RIDER" | "DRIVER" | null }) {
  const otherLabel = role === "DRIVER" ? "Rider" : "Driver";
  const otherPhone = role === "DRIVER" ? contact.riderContact : contact.driverContact;
  return (
    <Card>
      <Text style={styles.sectionTitle}>Contact unlocked</Text>
      <View style={styles.contactRow}>
        <View style={styles.contactAvatar}>
          <Ionicons name="call" size={16} color={colors.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactLabel}>{otherLabel}'s phone</Text>
          <Text style={styles.contactValue}>+91 {otherPhone}</Text>
        </View>
        <Pressable style={styles.callBtn} onPress={() => Linking.openURL(`tel:${otherPhone}`)}>
          <Ionicons name="call-outline" size={16} color="#1A0E08" />
        </Pressable>
      </View>

      {contact.otpCode && (
        <>
          <Divider />
          <Text style={styles.sectionTitle}>Ride-start OTP</Text>
          <Text style={styles.bodyText}>
            {role === "RIDER"
              ? "Show this code to your driver when they arrive to start the ride."
              : "Ask your rider for this code and enter it below to start the ride."}
          </Text>
          <View style={styles.otpBox}>
            <Text style={styles.otpText}>{contact.otpCode}</Text>
          </View>
        </>
      )}
    </Card>
  );
}

function StartRideCard({
  bookingId,
  role,
  contact,
  onChanged,
}: {
  bookingId: string;
  role: "RIDER" | "DRIVER" | null;
  contact: BookingContact;
  onChanged: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== "DRIVER") {
    return (
      <Card>
        <Text style={styles.sectionTitle}>Waiting for driver</Text>
        <Text style={styles.bodyText}>Your ride will begin once the driver enters the OTP above.</Text>
      </Card>
    );
  }

  const onStart = async () => {
    setError(null);
    if (!/^\d{4}$/.test(otp)) return setError("Enter the 4-digit OTP");
    setLoading(true);
    try {
      await bookingsApi.start(bookingId, otp);
      onChanged();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>Start the ride</Text>
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <Input
        placeholder="4-digit OTP from rider"
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ""))}
        style={{ letterSpacing: 6, textAlign: "center", fontSize: 18 }}
      />
      <Button label="Start ride" onPress={onStart} loading={loading} variant="teal" />
    </Card>
  );
}

function LiveRideCard({
  bookingId,
  role,
  contact,
  onChanged,
  setError,
}: {
  bookingId: string;
  role: "RIDER" | "DRIVER" | null;
  contact: BookingContact;
  onChanged: () => void;
  setError: (m: string | null) => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lng: number; updatedAt: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Driver: start/stop broadcasting device location.
  const toggleSharing = async () => {
    if (sharing) {
      watchRef.current?.remove();
      watchRef.current = null;
      setSharing(false);
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission is required to share your live position with the rider.");
      return;
    }
    setSharing(true);
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 8000, distanceInterval: 25 },
      async (pos) => {
        try {
          await bookingsApi.pingLocation(bookingId, pos.coords.latitude, pos.coords.longitude);
        } catch {
          // transient — next tick will retry
        }
      }
    );
  };

  // Rider: poll driver location periodically.
  useEffect(() => {
    if (role !== "RIDER") return;
    const tick = async () => {
      try {
        const loc = await bookingsApi.getLocation(bookingId);
        if (loc.driverLat != null && loc.driverLng != null) {
          setDriverLoc({ lat: loc.driverLat, lng: loc.driverLng, updatedAt: loc.locationUpdatedAt || "" });
        }
      } catch {
        // ignore transient polling errors
      }
    };
    tick();
    pollRef.current = setInterval(tick, 7000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [role, bookingId]);

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const onConfirmArrival = async () => {
    setConfirming(true);
    setError(null);
    try {
      await bookingsApi.confirmArrival(bookingId);
      onChanged();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConfirming(false);
    }
  };

  if (role === "DRIVER") {
    return (
      <Card style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Ride in progress</Text>
        <Text style={styles.bodyText}>
          Share your live location so the rider can track your route to the drop point.
        </Text>
        <Button
          label={sharing ? "Stop sharing location" : "Share live location"}
          onPress={toggleSharing}
          variant={sharing ? "danger" : "teal"}
          icon={<Ionicons name={sharing ? "stop-circle-outline" : "navigate-outline"} size={16} color={sharing ? "#fff" : "#062420"} />}
        />
        {sharing && <Text style={styles.footnote}>Broadcasting your position every ~8 seconds while active.</Text>}
      </Card>
    );
  }

  return (
    <Card style={{ gap: 12 }}>
      <Text style={styles.sectionTitle}>Ride in progress</Text>
      {driverLoc ? (
        <View style={styles.locBox}>
          <Ionicons name="location" size={18} color={colors.coral} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locText}>
              {driverLoc.lat.toFixed(5)}, {driverLoc.lng.toFixed(5)}
            </Text>
            <Text style={styles.footnote}>
              {driverLoc.updatedAt ? `Updated ${new Date(driverLoc.updatedAt).toLocaleTimeString()}` : ""}
            </Text>
          </View>
          <Pressable
            style={styles.mapBtn}
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${driverLoc.lat},${driverLoc.lng}`)}
          >
            <Ionicons name="map-outline" size={16} color="#1A0E08" />
          </Pressable>
        </View>
      ) : (
        <Text style={styles.bodyText}>Waiting for the driver to start sharing their location…</Text>
      )}
      <Button label="Confirm arrival & release payment" onPress={onConfirmArrival} loading={confirming} />
      <Text style={styles.footnote}>Only confirm once you've safely reached your destination.</Text>
    </Card>
  );
}

function CancelCard({
  bookingId,
  onChanged,
  setError,
}: {
  bookingId: string;
  onChanged: () => void;
  setError: (m: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const onCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await bookingsApi.cancel(bookingId);
      onChanged();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <Text style={styles.sectionTitle}>Need to cancel?</Text>
      <Text style={styles.bodyText}>
        Free cancellation up to 6 hours before departure. Late cancellations incur a 20% fee.
      </Text>
      <Button label="Cancel booking" onPress={onCancel} loading={loading} variant="danger" style={{ marginTop: 10 }} />
    </Card>
  );
}

function RateCard({ bookingId }: { bookingId: string }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (score < 1) return setError("Tap a star to rate");
    setLoading(true);
    try {
      await ratingsApi.submit(bookingId, score, comment.trim() || undefined);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) return <SuccessBanner message="Thanks for rating your ride!" />;

  return (
    <Card style={{ gap: 12 }}>
      <Text style={styles.sectionTitle}>Rate this ride</Text>
      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
      <RatingStars value={score} onChange={setScore} />
      <Input placeholder="Add a comment (optional)" value={comment} onChangeText={setComment} multiline />
      <Button label="Submit rating" onPress={onSubmit} loading={loading} />
    </Card>
  );
}

function DisputeCard({
  bookingId,
  onChanged,
  setError,
}: {
  bookingId: string;
  onChanged: () => void;
  setError: (m: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (reason.trim().length < 5) {
      setError("Describe the issue in a bit more detail");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await bookingsApi.raiseDispute(bookingId, reason.trim());
      onChanged();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ gap: 10 }}>
      <Pressable style={styles.disputeToggle} onPress={() => setOpen((o) => !o)}>
        <Ionicons name="warning-outline" size={16} color={colors.danger} />
        <Text style={styles.disputeToggleText}>Something wrong with this ride?</Text>
      </Pressable>
      {open && (
        <>
          <Input placeholder="Describe the issue…" value={reason} onChangeText={setReason} multiline />
          <Button label="Raise dispute" onPress={onSubmit} loading={loading} variant="danger" />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...type.h2, color: colors.textPrimary, marginBottom: 8 },
  bodyText: { ...type.body, color: colors.textSecondary },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.tealDim,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: { ...type.tiny, color: colors.textMuted },
  contactValue: { ...type.bodyMed, color: colors.textPrimary, marginTop: 2 },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBox: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.coral,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 8,
  },
  otpText: { ...type.display, color: colors.coral, letterSpacing: 6 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  totalLabel: { ...type.body, color: colors.textSecondary },
  totalValue: { ...type.h1, color: colors.coral },
  footnote: { ...type.small, color: colors.textMuted },
  locBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: radius.md },
  locText: { ...type.bodyMed, color: colors.textPrimary },
  mapBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  disputeToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  disputeToggleText: { ...type.small, color: colors.danger, fontWeight: "700" },
});
