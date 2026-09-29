import { formatChatTime } from "@/src/helpers/formatChatTime";
import { StyledText } from "@/src/shared/components/StyledText";
import { ArchiveIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";
import { Chat } from "../types";

interface ArchivedChatSummaryRowProps {
  chats: Chat[];
  onPress?: () => void;
}

const ICON_SIZE = 48;

export const ArchivedChatSummaryRow = ({ chats, onPress }: ArchivedChatSummaryRowProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const mostRecent = chats[0];
  const { label } = formatChatTime(mostRecent.timestamp);
  const names = chats.map((chat) => chat.name).join(", ");

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.icon}>
        <ArchiveIcon color={theme.buttonPrimaryText} />
      </View>
      <View style={styles.body}>
        <StyledText weight="bold" numberOfLines={1} style={styles.title}>
          Archived Chat
        </StyledText>
        <StyledText numberOfLines={1} ellipsizeMode="tail" style={styles.names}>
          {names}
        </StyledText>
      </View>
      <StyledText size={14} style={styles.timestamp}>
        {label}
      </StyledText>
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      padding: 12,
      backgroundColor: theme.bgNeutral,
    },
    icon: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      borderRadius: ICON_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: theme.textPrimary,
    },
    names: {
      color: theme.textSecondary,
    },
    timestamp: {
      color: theme.textSecondary,
    },
  });
