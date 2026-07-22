import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { GradientHeader } from "../../src/components/GradientHeader";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card } from "../../src/components/Card";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { ErrorBanner, SuccessBanner, EmptyState } from "../../src/components/Feedback";
import { listingsApi } from "../../src/api/listings";
import { useAuth } from "../../src/context/AuthContext";
import { VehicleType } from "../../src/types";
import { colors, radius, type } from "../../src/theme/theme";

const VEHICLES: { key: VehicleType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "HATCHBACK", label: "Hatchback", icon: "car-outline" },
  { key: "SEDAN", label: "Sedan", icon: "car-sport-outline" },
  { key: "SUV", label: "SUV", icon: "bus-outline" },
  { key: "BIKE", label: "Bike", icon: "bicycle-outline" },
];

export default function PostRideScreen() {
  const { profile } = useAuth();
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM
  const [vehicleType, setVehicleType] = useState<VehicleType>("SEDAN");
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState("");

  const [showCoords, setShowCoords] = useState(false);
  const [fromLat, setFromLat] = useState("");
  const [fromLng, setFromLng] = useState("");
  const [toLat, setToLat] = useState("");
  const [toLng, setToLng] = useState("");
  const [locating, setLocating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!profile?.fullyVerifiedAsDriver) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <GradientHeader eyebrow="Drive with us" title="Post a ride" subtitle="Turn empty seats into earnings." />
        <ScreenContainer>
          <Card>
            <EmptyState
              icon="shield-outline"
              title="Driver KYC required"
              subtitle="Aadhaar and Driving Licence verification must be complete before you can post a listing."
            />
            <Button label="Complete KYC" onPress={() => router.push("/(app)/kyc")} />
          </Card>
        </ScreenContainer>
      </View>
    );
  }

  const useCurrentLocationForPickup = async () => {
    setError(null);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is required to auto-fill your pickup point.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setFromLat(pos.coords.latitude.toFixed(6));
      setFromLng(pos.coords.longitude.toFixed(6));
      setShowCoords(true);
    } catch (e: any) {
      setError("Couldn't get your current location. Enter coordinates manually instead.");
    } finally {
      setLocating(false);
    }
  };

  const parseCoordPair = (
    latStr: string,
    lngStr: string,
    label: string
  ): { lat?: number; lng?: number } | "invalid" => {
    if (!latStr.trim() && !lngStr.trim()) return {};
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!latStr.trim() || !lngStr.trim() || isNaN(lat) || isNaN(lng)) {
      setError(`Enter both latitude and longitude for the ${label} point, or leave both blank`);
      return "invalid";
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError(`${label} coordinates are out of range`);
      return "invalid";
    }
    return { lat, lng };
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(false);
    if (fromCity.trim().length < 2 || toCity.trim().length < 2) return setError("Enter both cities");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError("Date must be YYYY-MM-DD");
    if (!/^\d{2}:\d{2}$/.test(time)) return setError("Time must be HH:MM (24h)");
    const departureTime = new Date(`${date}T${time}:00`);
    if (isNaN(departureTime.getTime()) || departureTime <= new Date()) {
      return setError("Departure must be a valid time in the future");
    }
    const price = Number(pricePerSeat);
    if (!price || price <= 0) return setError("Enter a valid price per seat");

    const from = parseCoordPair(fromLat, fromLng, "pickup");
    if (from === "invalid") return;
    const to = parseCoordPair(toLat, toLng, "drop");
    if (to === "invalid") return;

    setLoading(true);
    try {
      await listingsApi.create({
        fromCity: fromCity.trim(),
        toCity: toCity.trim(),
        fromLat: from.lat,
        fromLng: from.lng,
        toLat: to.lat,
        toLng: to.lng,
        departureTime: departureTime.toISOString(),
        vehicleType,
        seatsTotal,
        pricePerSeat: price,
      });
      setSuccess(true);
      setFromCity("");
      setToCity("");
      setDate("");
      setTime("");
      setPricePerSeat("");
      setFromLat("");
      setFromLng("");
      setToLat("");
      setToLng("");
      setTimeout(() => router.replace("/(app)/my-listings"), 900);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader eyebrow="Drive with us" title="Post a ride" subtitle="Set your route, price, and seats." />
      <ScreenContainer>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        {success ? <SuccessBanner message="Listing posted! Riders can now find and book it." /> : null}

        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input label="From city" placeholder="Kolkata" value={fromCity} onChangeText={setFromCity} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="To city" placeholder="Digha" value={toCity} onChangeText={setToCity} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input label="Departure date" placeholder="2026-08-02" value={date} onChangeText={setDate} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Departure time (24h)" placeholder="14:30" value={time} onChangeText={setTime} />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Vehicle type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {VEHICLES.map((v) => (
                <Pressable
                  key={v.key}
                  onPress={() => setVehicleType(v.key)}
                  style={[styles.chip, vehicleType === v.key && styles.chipActive]}
                >
                  <Ionicons name={v.icon} size={14} color={vehicleType === v.key ? "#1A0E08" : colors.textSecondary} />
                  <Text style={[styles.chipText, vehicleType === v.key && { color: "#1A0E08" }]}>{v.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Total seats</Text>
            <View style={styles.stepper}>
              <Pressable style={styles.stepperBtn} onPress={() => setSeatsTotal((s) => Math.max(1, s - 1))}>
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.stepperValue}>{seatsTotal}</Text>
              <Pressable style={styles.stepperBtn} onPress={() => setSeatsTotal((s) => Math.min(8, s + 1))}>
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          <Input
            label="Your price per seat"
            leftAdornment="₹"
            keyboardType="number-pad"
            placeholder="450"
            value={pricePerSeat}
            onChangeText={(t) => setPricePerSeat(t.replace(/[^0-9]/g, ""))}
            hint="This is an exact amount — not a range. Riders pay this per seat, and it's always your payout."
          />

          <Button label="Post ride" onPress={onSubmit} loading={loading} />
        </Card>

        <Card style={{ gap: 12 }}>
          <Pressable style={styles.coordsToggle} onPress={() => setShowCoords((s) => !s)}>
            <Ionicons name="pin-outline" size={16} color={colors.teal} />
            <Text style={styles.coordsToggleText}>Pickup & drop coordinates (optional)</Text>
            <Ionicons name={showCoords ? "chevron-up" : "chevron-down"} size={14} color={colors.teal} />
          </Pressable>

          {showCoords && (
            <View style={{ gap: 12 }}>
              <Text style={styles.bodyText}>
                Exact coordinates let riders see your pickup/drop pins on the map and open them directly in Google
                Maps. Leave blank to just use the city names.
              </Text>

              <Button
                label="Use my current location for pickup"
                onPress={useCurrentLocationForPickup}
                loading={locating}
                variant="teal"
                icon={<Ionicons name="navigate-outline" size={16} color="#062420" />}
              />

              <Text style={styles.coordGroupLabel}>Pickup point</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Latitude"
                    placeholder="22.5726"
                    keyboardType="numbers-and-punctuation"
                    value={fromLat}
                    onChangeText={setFromLat}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Longitude"
                    placeholder="88.3639"
                    keyboardType="numbers-and-punctuation"
                    value={fromLng}
                    onChangeText={setFromLng}
                  />
                </View>
              </View>

              <Text style={styles.coordGroupLabel}>Drop point</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Latitude"
                    placeholder="21.6270"
                    keyboardType="numbers-and-punctuation"
                    value={toLat}
                    onChangeText={setToLat}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Longitude"
                    placeholder="87.5090"
                    keyboardType="numbers-and-punctuation"
                    value={toLng}
                    onChangeText={setToLng}
                  />
                </View>
              </View>
              <Text style={styles.footnote}>
                Tip: right-click any point on Google Maps and tap the coordinates to copy them, then paste here.
              </Text>
            </View>
          )}
        </Card>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.small, color: colors.textSecondary },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.coral, borderColor: colors.coral },
  chipText: { ...type.small, color: colors.textSecondary },
  stepper: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 8 },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { ...type.h1, color: colors.textPrimary, minWidth: 24, textAlign: "center" },
  coordsToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  coordsToggleText: { ...type.small, color: colors.teal, fontWeight: "700", flex: 1 },
  bodyText: { ...type.small, color: colors.textMuted },
  coordGroupLabel: { ...type.tiny, color: colors.textMuted, textTransform: "uppercase" },
  footnote: { ...type.small, color: colors.textMuted },
});
