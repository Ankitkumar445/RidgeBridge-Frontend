import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, type } from "../theme/theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftAdornment?: string;
}

export function Input({ label, error, hint, leftAdornment, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.wrap,
          focused && styles.wrapFocused,
          error && styles.wrapError,
        ]}
      >
        {leftAdornment ? <Text style={styles.adornment}>{leftAdornment}</Text> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.small, color: colors.textSecondary },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
  },
  wrapFocused: {
    borderColor: colors.coral,
  },
  wrapError: {
    borderColor: colors.danger,
  },
  adornment: {
    color: colors.textSecondary,
    fontWeight: "700",
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 14,
    fontSize: 15.5,
  },
  error: { ...type.small, color: colors.danger },
  hint: { ...type.small, color: colors.textMuted },
});
