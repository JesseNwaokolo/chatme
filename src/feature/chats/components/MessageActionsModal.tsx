import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { REACTION_EMOJIS } from "../api/types";
import { ChatMessage } from "../types";

interface MessageActionsModalProps {
  message: ChatMessage | null;
  myUserId?: string;
  onClose: () => void;
  onReact: (message: ChatMessage, emoji: string | null) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
}

export const MessageActionsModal = ({
  message,
  myUserId,
  onClose,
  onReact,
  onEdit,
  onDelete,
}: MessageActionsModalProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const myReaction = message?.reactions?.find((r) => r.userId === myUserId)?.emoji;

  return (
    <Modal visible={!!message} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {message && (
          <Pressable style={styles.card}>
            <View style={styles.emojiRow}>
              {REACTION_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[styles.emoji, myReaction === emoji && styles.emojiSelected]}
                  onPress={() => {
                    onReact(message, myReaction === emoji ? null : emoji);
                    onClose();
                  }}
                >
                  <StyledText size={26}>{emoji}</StyledText>
                </Pressable>
              ))}
            </View>

            {message.fromMe && (
              <>
                <Pressable
                  style={styles.action}
                  onPress={() => {
                    onEdit(message);
                    onClose();
                  }}
                >
                  <StyledText weight="medium" size={16}>
                    Edit
                  </StyledText>
                </Pressable>
                <Pressable
                  style={styles.action}
                  onPress={() => {
                    onDelete(message);
                    onClose();
                  }}
                >
                  <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
                    Delete for everyone
                  </StyledText>
                </Pressable>
              </>
            )}
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(8, 28, 44, 0.5)",
      padding: 24,
    },
    card: {
      width: "100%",
      borderRadius: 16,
      paddingVertical: 8,
      backgroundColor: theme.bgNeutral,
    },
    emojiRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 8,
    },
    emoji: {
      padding: 6,
      borderRadius: 20,
    },
    emojiSelected: {
      backgroundColor: theme.bgPrimaryLighter,
    },
    action: {
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
  });
