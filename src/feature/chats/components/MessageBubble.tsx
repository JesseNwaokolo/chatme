import { StyledText } from "@/src/shared/components/StyledText";
import { CheckIcon, DoubleCheckIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Image } from "expo-image";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { ChatAttachment, ChatMessage } from "../types";

const MAPS_URL_RE = /https?:\/\/maps\.google\.com\/\?q=\S+/;
const ATTACHMENT_LABELS = { video: "🎥 Video", audio: "🎤 Voice message", document: "📄" } as const;
const IMAGE_SIZE = 200;

interface MessageBubbleProps {
  message: ChatMessage;
  receiptStatus?: "sent" | "delivered" | "read";
  onLongPress?: (message: ChatMessage) => void;
}

const AttachmentView = ({
  attachment,
  textColor,
}: {
  attachment: ChatAttachment;
  textColor: string;
}) => {
  if (attachment.type === "image") {
    const ratio =
      attachment.width && attachment.height ? attachment.width / attachment.height : 1;
    return (
      <Image
        source={{ uri: attachment.url }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE / Math.min(Math.max(ratio, 0.6), 1.6),
          borderRadius: 12,
          marginBottom: 6,
        }}
        contentFit="cover"
      />
    );
  }

  const label =
    attachment.type === "document"
      ? `${ATTACHMENT_LABELS.document} ${attachment.filename ?? "Document"}`
      : ATTACHMENT_LABELS[attachment.type];

  return (
    <Pressable
      onPress={() => Linking.openURL(attachment.url)}
      disabled={!/^https?:/.test(attachment.url)}
      style={{ marginBottom: 6 }}
    >
      <StyledText weight="medium" numberOfLines={2} style={{ color: textColor }}>
        {label}
      </StyledText>
    </Pressable>
  );
};

export const MessageBubble = ({ message, receiptStatus, onLongPress }: MessageBubbleProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const time = message.timestamp.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const textColor = message.fromMe ? theme.buttonPrimaryText : theme.textPrimary;
  const reactionSummary = (() => {
    const counts = new Map<string, number>();
    message.reactions?.forEach((r) => counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1));
    return [...counts.entries()].map(([emoji, n]) => (n > 1 ? `${emoji} ${n}` : emoji)).join("  ");
  })();
  const mapsUrl = message.text.match(MAPS_URL_RE)?.[0];

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
      <Pressable
        onLongPress={() => onLongPress?.(message)}
        delayLongPress={250}
        disabled={message.status === "sending" || message.deleted}
        style={[
          styles.bubble,
          message.fromMe ? styles.bubbleFromMe : styles.bubbleIncoming,
          message.status === "sending" && styles.bubbleSending,
        ]}
      >
        {message.deleted && (
          <StyledText style={{ color: textColor, fontStyle: "italic", opacity: 0.7 }}>
            This message was deleted
          </StyledText>
        )}
        {!message.deleted && message.attachments?.map((attachment, index) => (
          <AttachmentView
            key={`${attachment.url}-${index}`}
            attachment={attachment}
            textColor={textColor}
          />
        ))}
        {!message.deleted && !!message.text &&
          (mapsUrl ? (
            <Pressable onPress={() => Linking.openURL(mapsUrl)}>
              <StyledText style={{ color: textColor, textDecorationLine: "underline" }}>
                {message.text.replace(mapsUrl, "").trim()}
                {"\n"}Open in Maps
              </StyledText>
            </Pressable>
          ) : (
            <StyledText style={{ color: textColor }}>{message.text}</StyledText>
          ))}
        {message.edited && !message.deleted && (
          <StyledText size={11} style={{ color: textColor, opacity: 0.7 }}>
            edited
          </StyledText>
        )}
        {!!reactionSummary && (
          <View style={styles.reactions}>
            <StyledText size={13}>{reactionSummary}</StyledText>
          </View>
        )}
      </Pressable>
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
    reactions: {
      alignSelf: "flex-start",
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: theme.bgPrimaryLighter,
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
