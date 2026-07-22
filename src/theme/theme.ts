// RideBridge design system.
// Deliberately distinct from generic "AI app" blue/purple gradients:
// deep midnight-navy base, a warm coral "road" accent, and a cool
// verified-teal accent for trust/KYC signals.

export const colors = {
  bg: "#0A0E17",
  bgElevated: "#0F1420",
  surface: "#141B2B",
  surfaceAlt: "#1B2436",
  surfaceBorder: "#242F45",
  hairline: "#1E2740",

  textPrimary: "#F3F6FB",
  textSecondary: "#9AA6C0",
  textMuted: "#6B7590",

  coral: "#FF6B4A",
  coralDim: "#3A2620",
  amber: "#FFB020",
  teal: "#22D3B8",
  tealDim: "#12332E",
  violet: "#8B7CF6",
  danger: "#FF5C7A",
  dangerDim: "#3A1B27",
  success: "#3DDC97",

  overlay: "rgba(6,8,14,0.72)",
};

export const gradients = {
  hero: ["#161227", "#1C1430", "#0A0E17"] as const,
  coral: ["#FF7A52", "#FF5A3C"] as const,
  teal: ["#2BE0C4", "#17B39C"] as const,
  card: ["#171F31", "#121826"] as const,
  admin: ["#241329", "#160E22", "#0A0E17"] as const,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const type = {
  display: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.3 },
  h2: { fontSize: 19, fontWeight: "700" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "400" as const },
  bodyMed: { fontSize: 15, fontWeight: "600" as const },
  small: { fontSize: 13, fontWeight: "500" as const },
  tiny: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.6 },
};

export const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING_PAYMENT: { label: "Awaiting payment", color: colors.amber, bg: "#3A2E12" },
  PAID_HELD: { label: "Held in escrow", color: colors.teal, bg: colors.tealDim },
  IN_PROGRESS: { label: "Ride in progress", color: colors.violet, bg: "#241F3D" },
  COMPLETED: { label: "Completed", color: colors.success, bg: "#123028" },
  CANCELLED_BY_RIDER: { label: "Cancelled by rider", color: colors.textMuted, bg: colors.surfaceAlt },
  CANCELLED_BY_DRIVER: { label: "Cancelled by driver", color: colors.textMuted, bg: colors.surfaceAlt },
  DISPUTED: { label: "Disputed", color: colors.danger, bg: colors.dangerDim },
  ACTIVE: { label: "Active", color: colors.teal, bg: colors.tealDim },
  FULL: { label: "Full", color: colors.amber, bg: "#3A2E12" },
  CANCELLED: { label: "Cancelled", color: colors.textMuted, bg: colors.surfaceAlt },
  COMPLETED_LISTING: { label: "Completed", color: colors.success, bg: "#123028" },
  NOT_STARTED: { label: "Not started", color: colors.textMuted, bg: colors.surfaceAlt },
  PENDING: { label: "Pending", color: colors.amber, bg: "#3A2E12" },
  VERIFIED: { label: "Verified", color: colors.teal, bg: colors.tealDim },
  FAILED: { label: "Failed", color: colors.danger, bg: colors.dangerDim },
};
