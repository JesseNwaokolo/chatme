import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, StarIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";
import { StarredMessage } from "../data/mockStarredMessages";

interface StarredMessageItemProps {
  message: StarredMessage;
  onPress?: () => void;
}

export const StarredMessageItem = ({ message, onPress }: StarredMessageItemProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.bubble}>
          <StyledText style={styles.bubbleText}>{message.text}</StyledText>
          <View style={styles.starIcon}>
            <StarIcon size={16} color={theme.warning} filled />
          </View>
        </View>
        <StyledText size={14} style={styles.time}>
          {message.time}
        </StyledText>
      </View>

      <Pressable style={styles.senderRow} onPress={onPress}>
        <Avatar name={message.senderName} imageUrl={message.avatarUrl} size={40} />
        <StyledText weight="bold" style={styles.senderName} numberOfLines={1}>
          {message.senderName}
        </StyledText>
        <StyledText size={14} style={styles.date}>
          {message.date}
        </StyledText>
        <View style={styles.chevron}>
          <ChevronLeftIcon size={18} color={theme.textSecondary} />
        </View>
      </Pressable>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    card: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
      backgroundColor: theme.bgPrimaryLighter,
      borderRadius: 20,
      padding: 12,
    },
    bubble: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 28,
    },
    bubbleText: {
      color: theme.textPrimary,
    },
    starIcon: {
      position: "absolute",
      right: 14,
      bottom: 12,
    },
    time: {
      color: theme.textSecondary,
    },
    senderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    senderName: {
      flex: 1,
      color: theme.textPrimary,
    },
    date: {
      color: theme.textSecondary,
    },
    chevron: {
      transform: [{ rotate: "180deg" }],
    },
  });
