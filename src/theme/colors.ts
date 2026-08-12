const colors = {
  primaryLight: "#F7FFFA",
  Neutral700: "#163043",
  light : "#FFFFFF",
  accent: "#57B77D",
  neutral900 : "#081C2C",
  neutral300 : "#6E8597",
  divider : "#EAEEF2"
};

export const lightTheme = {
  bgPrimaryLight: colors.primaryLight,
  bgNeutral: colors.light,
  buttonPrimary: colors.accent,
  buttonPrimaryText: colors.light,
  textPrimary: colors.neutral900,
  textSecondary: colors.neutral300,
  border : colors.divider,
} as const;

export const darkTheme: typeof lightTheme = {
  bgPrimaryLight: colors.Neutral700,
  bgNeutral: colors.neutral900,
  buttonPrimary: colors.accent,
  buttonPrimaryText: colors.light,
  textPrimary: colors.light,
  textSecondary: colors.neutral300,
  border : colors.divider,
}

