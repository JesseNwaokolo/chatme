import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { StyleSheet, Text, TextProps } from "react-native";

interface StyledTextProps extends TextProps {
  weight?: keyof typeof fonts;
  size?: number;
}

export const StyledText = ({
  weight = "regular",
  size = 16,
  style,
  ...rest
}: StyledTextProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Text
      style={[
        styles.text,
        {
          fontFamily: fonts[weight],
          fontSize: getScaledFontSize(size),
          lineHeight: getLineHeight(size),
        },
        style,
      ]}
      {...rest}
    />
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    text: {
      color: theme.textPrimary,
    },
  });
};
