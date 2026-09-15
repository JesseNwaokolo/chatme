import { StyledText } from "@/src/shared/components/StyledText";
import { CheckIcon, DoubleCheckIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { StyleSheet, View } from "react-native";
import { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
  receiptStatus?: "sent" | "delivered" | "read";
}

export const MessageBubble = ({ message, receiptStatus }: MessageBubbleProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const time = message.timestamp.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <View style={[styles.row, message.fromMe && styles.rowFromMe]}>
      {message.fromMe && (
        <View style={styles.metaRow}>
          <StyledText size={13} style={styles.timestamp}>
            {time}
          </StyledText>
          {receiptStatus === "sent" && <CheckIcon size={14} color={theme.textSecondary} />}
          {receiptStatus === "delivered" && (
            <DoubleCheckIcon size={14} color={theme.textSecondary} />
          )}
          {receiptStatus === "read" && (
            <DoubleCheckIcon size={14} color={theme.buttonPrimary} />
          )}
        </View>
      )}
      <View
        style={[
          styles.bubble,
          message.fromMe ? styles.bubbleFromMe : styles.bubbleIncoming,
          message.status === "sending" && styles.bubbleSending,
        ]}
      >
        <StyledText
          style={{ color: message.fromMe ? theme.buttonPrimaryText : theme.textPrimary }}
        >
          {message.text}
        </StyledText>
      </View>
      {!message.fromMe && (
        <StyledText size={13} style={styles.timestamp}>
          {time}
        </StyledText>
      )}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
      marginBottom: 16,
    },
    rowFromMe: {
      flexDirection: "row-reverse",
    },
    bubble: {
      maxWidth: "72%",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    bubbleIncoming: {
      backgroundColor: theme.bgNeutral,
    },
    bubbleFromMe: {
      backgroundColor: theme.buttonPrimary,
    },
    bubbleSending: {
      opacity: 0.6,
    },
    timestamp: {
      color: theme.textSecondary,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
  });
