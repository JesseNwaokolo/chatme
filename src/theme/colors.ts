const colors = {
  primaryLight: "#F7FFFA",
  Neutral700: "#163043",
  light : "#FFFFFF",
  accent: "#57B77D",
  neutral900 : "#081C2C",
  neutral300 : "#6E8597",
  divider : "#EAEEF2",
  shadow : "#0B131B",
  shadow2 : "#0E141D",
  primaryLighter : "#F5FBF7",
  border : "#DDE2E8",
  warning : "#E8A13A",
  danger : "#DD524C",
  neutralAction : "#B3C2CE",
  neutralActionLight : "#DDE2E8"
};

export const lightTheme = {
  bgPrimaryLight: colors.primaryLight,
  bgPrimaryLighter: colors.primaryLighter,
  bgNeutral: colors.light,
  buttonPrimary: colors.accent,
  buttonPrimaryText: colors.light,
  textPrimary: colors.neutral900,
  textSecondary: colors.neutral300,
  border : colors.divider,
  border2 : colors.border,
  shadow : colors.shadow,
  shadow2 : colors.shadow2,
  warning : colors.warning,
  danger : colors.danger,
  neutralAction : colors.neutralAction,
  neutralActionLight : colors.neutralActionLight
} as const;

export const darkTheme: typeof lightTheme = {
  bgPrimaryLight: colors.Neutral700,
  bgPrimaryLighter: colors.primaryLighter,
  bgNeutral: colors.neutral900,
  buttonPrimary: colors.accent,
  buttonPrimaryText: colors.light,
  textPrimary: colors.light,
  textSecondary: colors.neutral300,
  border : colors.divider,
  border2 : colors.border,
  shadow : colors.shadow,
  shadow2 : colors.shadow2,
  warning : colors.warning,
  danger : colors.danger,
  neutralAction : colors.neutralAction,
  neutralActionLight : colors.neutralActionLight
}

