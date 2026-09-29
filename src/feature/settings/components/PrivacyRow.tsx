import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";

interface PrivacyRowProps {
  label: string;
  value?: string;
  showDivider?: boolean;
  onPress?: () => void;
}

export const PrivacyRow = ({
  label,
  value,
  showDivider = true,
  onPress,
}: PrivacyRowProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable style={[styles.row, showDivider && styles.divider]} onPress={onPress}>
      <StyledText size={17} weight="medium" style={styles.label}>
        {label}
      </StyledText>
      <View style={styles.right}>
        {value ? (
          <StyledText size={16} style={styles.value}>
            {value}
          </StyledText>
        ) : null}
        <View style={styles.chevron}>
          <ChevronLeftIcon size={18} color={theme.textSecondary} />
        </View>
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
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    value: {
      color: theme.textSecondary,
    },
    chevron: {
      transform: [{ rotate: "180deg" }],
    },
  });
