import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../../src/components/GradientHeader";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card, Divider } from "../../src/components/Card";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { StatusPill } from "../../src/components/StatusPill";
import { ErrorBanner, LoadingBlock, SuccessBanner } from "../../src/components/Feedback";
import { verificationApi } from "../../src/api/misc";
import { useAuth } from "../../src/context/AuthContext";
import { Role } from "../../src/types";
import { colors, radius, type } from "../../src/theme/theme";

const ROLE_OPTIONS: { key: Role; label: string; hint: string }[] = [
  { key: "RIDER", label: "Rider only", hint: "Just Aadhaar verification" },
  { key: "DRIVER", label: "Driver", hint: "Aadhaar + Driving Licence" },
  { key: "BOTH", label: "Both", hint: "Aadhaar + Driving Licence" },
];

export default function KycScreen() {
  const { profile, refreshProfile } = useAuth();
  const [dob, setDob] = useState("");
  const [requestedRole, setRequestedRole] = useState<Role>("DRIVER");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [settingDob, setSettingDob] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, []);

  const onSetDob = async () => {
    setError(null);
    setInfo(null);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return setError("Enter date of birth as YYYY-MM-DD");
    setSettingDob(true);
    try {
      const r = await verificationApi.setDob(dob);
      setInfo(
        r.canBeDriver
          ? `Age confirmed: ${r.age}. You're eligible to drive.`
          : `Age confirmed: ${r.age}. Driver access requires ${r.minAgeForDriver}+, so you're set up as a rider.`
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSettingDob(false);
    }
  };

  const onInitiate = async () => {
    setError(null);
    setInfo(null);
    setInitiating(true);
    try {
      const r = await verificationApi.initiate(requestedRole);
      const result = await WebBrowser.openAuthSessionAsync(r.redirectUrl, undefined);
      // The callback itself is hit server-side by DigiLocker/Setu (no JWT),
      // so once the browser session closes we just re-check status.
      if (result.type === "success" || result.type === "dismiss" || result.type === "cancel") {
        await refreshProfile();
        setInfo("Checked your latest verification status below.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInitiating(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GradientHeader
        eyebrow="Trust & safety"
        title="Identity verification"
        subtitle="Required before you can post rides as a driver."
        right={
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        {info ? <SuccessBanner message={info} /> : null}

        <Card>
          <Text style={styles.sectionTitle}>Current status</Text>
          {!profile ? (
            <LoadingBlock />
          ) : (
            <View style={{ gap: 12 }}>
              <StatusRow label="Aadhaar" status={profile.aadhaarKycStatus} />
              <StatusRow label="Driving licence" status={profile.drivingLicenceKycStatus} />
              <Divider />
              <View style={styles.checklistRow}>
                <Ionicons
                  name={profile.fullyVerifiedAsRider ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={profile.fullyVerifiedAsRider ? colors.teal : colors.textMuted}
                />
                <Text style={styles.checklistText}>Cleared to ride</Text>
              </View>
              <View style={styles.checklistRow}>
                <Ionicons
                  name={profile.fullyVerifiedAsDriver ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={profile.fullyVerifiedAsDriver ? colors.teal : colors.textMuted}
                />
                <Text style={styles.checklistText}>Cleared to post rides</Text>
              </View>
            </View>
          )}
        </Card>

        <Card style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>1. Confirm date of birth</Text>
          <Input label="Date of birth" placeholder="1998-04-12" value={dob} onChangeText={setDob} />
          <Button label="Save date of birth" onPress={onSetDob} loading={settingDob} variant="outline" />
        </Card>

        <Card style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>2. Verify with DigiLocker</Text>
          <Text style={styles.bodyText}>Choose what you're verifying for, then complete consent via DigiLocker.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ROLE_OPTIONS.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setRequestedRole(r.key)}
                style={[styles.roleChip, requestedRole === r.key && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipLabel, requestedRole === r.key && { color: "#062420" }]}>{r.label}</Text>
                <Text style={[styles.roleChipHint, requestedRole === r.key && { color: "#0A3A32" }]}>{r.hint}</Text>
              </Pressable>
            ))}
          </View>
          <Button label="Start DigiLocker verification" onPress={onInitiate} loading={initiating} variant="teal" />
        </Card>
      </ScreenContainer>
    </View>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <StatusPill status={status} small />
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
  sectionTitle: { ...type.h2, color: colors.textPrimary, marginBottom: 10 },
  bodyText: { ...type.body, color: colors.textSecondary },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusLabel: { ...type.bodyMed, color: colors.textPrimary },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checklistText: { ...type.small, color: colors.textSecondary },
  roleChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minWidth: 120,
  },
  roleChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  roleChipLabel: { ...type.bodyMed, color: colors.textPrimary },
  roleChipHint: { ...type.tiny, color: colors.textMuted, marginTop: 2 },
});
