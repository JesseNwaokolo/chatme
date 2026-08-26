import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  type: "nav" | "toggle";
  onPress?: () => void;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

export const SettingsRow = ({
  icon,
  label,
  type,
  onPress,
  value,
  onToggle,
  destructive = false,
}: SettingsRowProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const content = (
    <View style={styles.row}>
      <View style={styles.iconBadge}>{icon}</View>
      <StyledText
        size={16}
        style={[styles.label, destructive && { color: theme.danger }]}
        weight="medium"
      >
        {label}
      </StyledText>
      {type === "toggle" ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.buttonPrimary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <View style={styles.chevron}>
          <ChevronLeftIcon size={20} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );

  if (type === "toggle") {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.bgPrimaryLighter,
    },
    label: {
      flex: 1,
      color: theme.textTertiary,
    },
    chevron: {
      transform: [{ rotate: "180deg" }],
    },
  });
};
