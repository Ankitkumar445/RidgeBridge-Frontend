import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../src/components/GradientHeader";
import { Input } from "../../src/components/Input";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/StatusPill";
import { EmptyState, ErrorBanner, LoadingBlock } from "../../src/components/Feedback";
import { listingsApi } from "../../src/api/listings";
import { useAuth } from "../../src/context/AuthContext";
import { Listing, VehicleType } from "../../src/types";
import { colors, radius, type } from "../../src/theme/theme";

const VEHICLES: { key: VehicleType | undefined; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: undefined, label: "All", icon: "apps-outline" },
  { key: "HATCHBACK", label: "Hatchback", icon: "car-outline" },
  { key: "SEDAN", label: "Sedan", icon: "car-sport-outline" },
  { key: "SUV", label: "SUV", icon: "bus-outline" },
  { key: "BIKE", label: "Bike", icon: "bicycle-outline" },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await listingsApi.search({
        fromCity: fromCity.trim() || undefined,
        toCity: toCity.trim() || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        vehicleType,
      });
      setListings(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fromCity, toCity, minPrice, maxPrice, vehicleType]);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader
        eyebrow="RideBridge"
        title={`Hey ${user?.name?.split(" ")[0] || "there"} 👋`}
        subtitle="Find a verified driver headed your way."
      />

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 14 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 4 }}>
            <Card>
              <View style={styles.routeRow}>
                <View style={{ flex: 1 }}>
                  <Input placeholder="From city" value={fromCity} onChangeText={setFromCity} />
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.textMuted} style={{ marginTop: 14 }} />
                <View style={{ flex: 1 }}>
                  <Input placeholder="To city" value={toCity} onChangeText={setToCity} />
                </View>
              </View>

              <Pressable style={styles.filterToggle} onPress={() => setShowFilters((s) => !s)}>
                <Ionicons name="options-outline" size={15} color={colors.coral} />
                <Text style={styles.filterToggleText}>{showFilters ? "Hide filters" : "Price & vehicle filters"}</Text>
                <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={15} color={colors.coral} />
              </Pressable>

              {showFilters && (
                <View style={{ gap: 12, marginTop: 12 }}>
                  <Text style={styles.rangeLabel}>Price range per seat</Text>
                  <View style={styles.routeRow}>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Min price"
                        leftAdornment="₹"
                        keyboardType="number-pad"
                        value={minPrice}
                        onChangeText={setMinPrice}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Max price"
                        leftAdornment="₹"
                        keyboardType="number-pad"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {VEHICLES.map((v) => (
                      <Pressable
                        key={v.label}
                        onPress={() => setVehicleType(v.key)}
                        style={[styles.chip, vehicleType === v.key && styles.chipActive]}
                      >
                        <Ionicons name={v.icon} size={14} color={vehicleType === v.key ? "#1A0E08" : colors.textSecondary} />
                        <Text style={[styles.chipText, vehicleType === v.key && { color: "#1A0E08" }]}>{v.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <Pressable style={styles.searchBtn} onPress={() => fetchListings()}>
                <Ionicons name="search" size={16} color="#1A0E08" />
                <Text style={styles.searchBtnText}>Search rides</Text>
              </Pressable>
            </Card>

            {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
            {loading ? <LoadingBlock label="Finding rides…" /> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="map-outline"
              title="No rides found"
              subtitle="Try widening your price range or clearing the filters."
            />
          ) : null
        }
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </View>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const departure = new Date(listing.departureTime);
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/(app)/listing/[id]", params: { id: listing.id, data: JSON.stringify(listing) } })
      }
    >
      <Card>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.cityRow}>
              <Text style={styles.city}>{listing.fromCity}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
              <Text style={styles.city}>{listing.toCity}</Text>
            </View>
            <Text style={styles.time}>
              {departure.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
              {departure.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>₹{listing.pricePerSeat}</Text>
            <Text style={styles.priceLabel}>per seat</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Badge label={listing.vehicleType} tone="neutral" />
          <View style={styles.seatRow}>
            <Ionicons name="people-outline" size={13} color={colors.textMuted} />
            <Text style={styles.seatText}>{listing.seatsAvailable} seats left</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.driverRow}>
            {listing.driver?.isVerified && <Ionicons name="checkmark-circle" size={14} color={colors.teal} />}
            <Text style={styles.driverName}>{listing.driver?.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.amber} />
              <Text style={styles.ratingText}>{listing.driver?.rating?.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  filterToggle: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  filterToggleText: { ...type.small, color: colors.coral, fontWeight: "700" },
  rangeLabel: { ...type.tiny, color: colors.textMuted, textTransform: "uppercase" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.coral, borderColor: colors.coral },
  chipText: { ...type.small, color: colors.textSecondary },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.coral,
    paddingVertical: 13,
    borderRadius: radius.md,
    marginTop: 14,
  },
  searchBtnText: { ...type.bodyMed, color: "#1A0E08" },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  city: { ...type.h2, color: colors.textPrimary },
  time: { ...type.small, color: colors.textMuted, marginTop: 4 },
  priceWrap: { alignItems: "flex-end" },
  price: { ...type.h1, color: colors.coral },
  priceLabel: { ...type.tiny, color: colors.textMuted },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  seatRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  seatText: { ...type.small, color: colors.textMuted },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  driverName: { ...type.small, color: colors.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginLeft: 4 },
  ratingText: { ...type.small, color: colors.textSecondary },
});
