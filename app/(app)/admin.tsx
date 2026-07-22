import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../src/components/GradientHeader";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card, Divider } from "../../src/components/Card";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { StatusPill } from "../../src/components/StatusPill";
import { EmptyState, ErrorBanner, LoadingBlock } from "../../src/components/Feedback";
import { adminApi } from "../../src/api/misc";
import { AdminBooking, BookingStatus } from "../../src/types";
import { colors, radius, type } from "../../src/theme/theme";

const STATUS_FILTERS: (BookingStatus | "ALL")[] = [
  "ALL",
  "PENDING_PAYMENT",
  "PAID_HELD",
  "IN_PROGRESS",
  "COMPLETED",
  "DISPUTED",
  "CANCELLED_BY_RIDER",
  "CANCELLED_BY_DRIVER",
];

export default function AdminScreen() {
  const [tab, setTab] = useState<"bookings" | "disputes">("disputes");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        tab === "disputes"
          ? await adminApi.listDisputes()
          : await adminApi.listBookings(statusFilter === "ALL" ? undefined : statusFilter);
      setBookings(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader eyebrow="Admin console" title="Operations" subtitle="Bookings, escrow & disputes." variant="admin" />
      <ScreenContainer onRefresh={load} refreshing={loading}>
        <View style={styles.tabRow}>
          <TabBtn label="Disputes" active={tab === "disputes"} onPress={() => setTab("disputes")} />
          <TabBtn label="All bookings" active={tab === "bookings"} onPress={() => setTab("bookings")} />
        </View>

        {tab === "bookings" && (
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((s) => (
              <Pressable key={s} onPress={() => setStatusFilter(s)} style={[styles.chip, statusFilter === s && styles.chipActive]}>
                <Text style={[styles.chipText, statusFilter === s && { color: "#fff" }]}>
                  {s === "ALL" ? "All" : s.replace(/_/g, " ")}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        {loading ? (
          <LoadingBlock label="Loading…" />
        ) : bookings.length === 0 ? (
          <EmptyState icon="file-tray-outline" title={tab === "disputes" ? "No open disputes" : "No bookings"} />
        ) : (
          bookings.map((b) => <AdminBookingCard key={b.id} booking={b} onResolved={load} />)
        )}
      </ScreenContainer>
    </View>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabBtnText, active && { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function AdminBookingCard({ booking, onResolved }: { booking: AdminBooking; onResolved: () => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"REFUND_RIDER" | "RELEASE_DRIVER" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (resolution: "REFUND_RIDER" | "RELEASE_DRIVER") => {
    setLoading(resolution);
    setError(null);
    try {
      await adminApi.resolveDispute(booking.id, resolution, notes.trim() || "Resolved by admin");
      onResolved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.route}>
          {booking.listing.fromCity} → {booking.listing.toCity}
        </Text>
        <StatusPill status={booking.status} small />
      </View>
      <Text style={styles.footnote}>{new Date(booking.listing.departureTime).toLocaleString()}</Text>

      <View style={styles.metaGrid}>
        <MetaCol label="Amount" value={`₹${booking.amount}`} />
        <MetaCol label="Driver payout" value={`₹${booking.driverPayoutAmount}`} />
        <MetaCol label="Platform fee" value={`₹${booking.platformFee}`} />
      </View>

      <Divider />

      <View style={{ gap: 4 }}>
        <Text style={styles.partyText}>
          Rider: {booking.rider.name} · +91 {booking.rider.phone}
        </Text>
        <Text style={styles.partyText}>
          Driver: {booking.listing.driver.name} · +91 {booking.listing.driver.phone}
        </Text>
      </View>

      {booking.disputeReason && (
        <View style={styles.disputeBox}>
          <Text style={styles.disputeLabel}>Dispute reason</Text>
          <Text style={styles.disputeText}>{booking.disputeReason}</Text>
        </View>
      )}

      {booking.status === "DISPUTED" && (
        <>
          {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
          {!open ? (
            <Button label="Resolve dispute" onPress={() => setOpen(true)} variant="outline" />
          ) : (
            <View style={{ gap: 10 }}>
              <Input placeholder="Resolution notes" value={notes} onChangeText={setNotes} multiline />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Refund rider"
                    onPress={() => resolve("REFUND_RIDER")}
                    loading={loading === "REFUND_RIDER"}
                    variant="danger"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Release to driver"
                    onPress={() => resolve("RELEASE_DRIVER")}
                    loading={loading === "RELEASE_DRIVER"}
                    variant="teal"
                  />
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </Card>
  );
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", gap: 8 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  tabBtnActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.violet },
  tabBtnText: { ...type.bodyMed, color: colors.textMuted },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  chipText: { ...type.tiny, color: colors.textSecondary, textTransform: "capitalize" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  route: { ...type.h2, color: colors.textPrimary },
  footnote: { ...type.small, color: colors.textMuted },
  metaGrid: { flexDirection: "row" },
  metaValue: { ...type.bodyMed, color: colors.textPrimary },
  metaLabel: { ...type.tiny, color: colors.textMuted, marginTop: 2 },
  partyText: { ...type.small, color: colors.textSecondary },
  disputeBox: { backgroundColor: colors.dangerDim, borderRadius: radius.md, padding: 10, gap: 4 },
  disputeLabel: { ...type.tiny, color: colors.danger },
  disputeText: { ...type.small, color: colors.textSecondary },
});
