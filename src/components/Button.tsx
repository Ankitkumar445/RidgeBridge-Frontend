import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, radius, shadow, type } from "../theme/theme";

type Variant = "primary" | "teal" | "outline" | "ghost" | "danger";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
  icon,
  fullWidth = true,
}: Props) {
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? colors.coral : "#0A0E17"} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              (variant === "outline" || variant === "ghost") && { color: colors.textPrimary },
              variant === "primary" && { color: "#1A0E08" },
              variant === "teal" && { color: "#062420" },
              variant === "danger" && { color: "#fff" },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </>
  );

  if (variant === "primary" || variant === "teal") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          fullWidth && { alignSelf: "stretch" },
          { opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={variant === "primary" ? gradients.coral : gradients.teal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, shadow.glow]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && { alignSelf: "stretch" },
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        variant === "danger" && styles.danger,
        { opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: "transparent",
  },
  ghost: {
    backgroundColor: colors.surfaceAlt,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  label: {
    ...type.bodyMed,
    fontSize: 15.5,
  },
});
