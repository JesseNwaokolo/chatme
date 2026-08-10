const colors = {
  primaryLight: "#F7FFFA",
  Neutral700: "#163043",
  light : "#FFFFFF",
  dark : "#081C2C"
};

export const lightTheme = {
  bgPrimaryLight: colors.primaryLight,
  bgNeutral: colors.light,
} as const;

export const darkTheme: typeof lightTheme = {
  bgPrimaryLight: colors.Neutral700,
  bgNeutral: colors.dark,
}

