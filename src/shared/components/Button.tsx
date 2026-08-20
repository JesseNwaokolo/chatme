import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export const Button = ({
  title,
  loading,
  disabled,
  style,
  variant = "primary",
  ...rest
}: ButtonProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isSecondary ? theme.buttonPrimary : theme.buttonPrimaryText}
        />
      ) : (
        <Text style={[styles.text, isSecondary && styles.textSecondary]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    button: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 32,
    },
    buttonSecondary: {
      backgroundColor: theme.bgPrimaryLighter,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    text: {
      color: theme.buttonPrimaryText,
      fontFamily: fonts.bold,
      fontSize: getScaledFontSize(14),
      lineHeight: getLineHeight(14),
    },
    textSecondary: {
      color: theme.buttonPrimary,
    },
  });
};
