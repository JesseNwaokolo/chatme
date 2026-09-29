import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import { CallDirectionIcon, InfoCircleIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";
import { CallLogEntry, CallType } from "../data/mockCallLog";
import { formatCallTime } from "../utils/callLog";

const CALL_TYPE_LABEL: Record<CallType, string> = {
  incoming: "Incoming",
  outgoing: "Outgoing",
  missed: "Missed Call",
};

interface CallLogItemProps {
  entry: CallLogEntry;
  showDivider?: boolean;
  onPress?: () => void;
  onInfoPress?: () => void;
}

export const CallLogItem = ({
  entry,
  showDivider = true,
  onPress,
  onInfoPress,
}: CallLogItemProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable
      style={[styles.row, showDivider && styles.divider]}
      onPress={onPress}
    >
      <Avatar name={entry.name} imageUrl={entry.avatarUrl} size={48} />
      <View style={styles.body}>
        <StyledText weight="bold" numberOfLines={1} ellipsizeMode="tail">
          {entry.name}
        </StyledText>
        <View style={styles.typeRow}>
          <CallDirectionIcon
            size={13}
            color={theme.textSecondary}
            direction={entry.type === "outgoing" ? "outgoing" : "incoming"}
          />
          <StyledText size={14} style={styles.typeLabel}>
            {CALL_TYPE_LABEL[entry.type]}
          </StyledText>
        </View>
      </View>
      <View style={styles.meta}>
        <StyledText size={15} style={styles.time}>
          {formatCallTime(entry.timestamp)}
        </StyledText>
        <Pressable onPress={onInfoPress} hitSlop={10}>
          <InfoCircleIcon size={22} color={theme.buttonPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    typeLabel: {
      color: theme.textSecondary,
    },
    meta: {
      alignItems: "flex-end",
      gap: 6,
    },
    time: {
      color: theme.textSecondary,
    },
  });
