import { StyledText } from "@/src/shared/components/StyledText";
import { CheckIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";

interface RadioRowProps {
  label: string;
  selected: boolean;
  showDivider?: boolean;
  onPress?: () => void;
}

const RADIO_SIZE = 26;

export const RadioRow = ({
  label,
  selected,
  showDivider = true,
  onPress,
}: RadioRowProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable style={[styles.row, showDivider && styles.divider]} onPress={onPress}>
      <StyledText size={17} weight="medium" style={styles.label}>
        {label}
      </StyledText>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <CheckIcon size={14} color={theme.buttonPrimaryText} />}
      </View>
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 18,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    label: {
      color: theme.textPrimary,
    },
    radio: {
      width: RADIO_SIZE,
      height: RADIO_SIZE,
      borderRadius: RADIO_SIZE / 2,
      borderWidth: 1.5,
      borderColor: theme.border2,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      borderColor: theme.buttonPrimary,
      backgroundColor: theme.buttonPrimary,
    },
  });
