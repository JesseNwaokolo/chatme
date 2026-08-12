export const fonts = {
  regular: "SFProDisplay-Regular",
  medium: "SFProDisplay-Medium",
  bold: "SFProDisplay-Bold",
} as const;

export const fontAssets = {
  [fonts.regular]: require("@/assets/fonts/SFPRODISPLAYREGULAR.otf"),
  [fonts.medium]: require("@/assets/fonts/SFPRODISPLAYMEDIUM.otf"),
  [fonts.bold]: require("@/assets/fonts/SFPRODISPLAYBOLD.otf"),
};
