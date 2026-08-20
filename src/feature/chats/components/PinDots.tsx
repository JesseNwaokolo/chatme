import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { StyleSheet, View } from "react-native";

const PIN_LENGTH = 4;

interface PinDotsProps {
  length: number;
}

export const PinDots = ({ length }: PinDotsProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.row}>
      {Array.from({ length: PIN_LENGTH }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index < length && styles.dotFilled]}
        />
      ))}
    </View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 16,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border2,
    },
    dotFilled: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
    },
  });
};
