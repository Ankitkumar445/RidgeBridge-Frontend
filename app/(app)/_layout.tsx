import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme/theme";

export default function AppLayout() {
  const { user, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.coral} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  const isAdmin = profile?.role === "ADMIN";
  // The backend only gates listing creation on KYC status (aadhaarKycStatus +
  // drivingLicenceKycStatus both VERIFIED — see listings.service.ts), never on
  // the `role` field. `role` stays "RIDER" by default even for a fully
  // KYC-verified driver, so checking it here was hiding the Post-ride and
  // My-trips tabs for every verified driver. Check the real KYC flag instead.
  const canDrive = !!profile?.fullyVerifiedAsDriver || isAdmin;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 66,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-ride"
        options={{
          title: "Post ride",
          href: canDrive ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-listings"
        options={{
          title: "My trips",
          href: canDrive ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => <Ionicons name="ticket" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="shield" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="kyc" options={{ href: null }} />
      <Tabs.Screen name="listing/[id]" options={{ href: null }} />
      <Tabs.Screen name="bookings/[id]" options={{ href: null }} />
      <Tabs.Screen name="user/[id]" options={{ href: null }} />
    </Tabs>
  );
}
