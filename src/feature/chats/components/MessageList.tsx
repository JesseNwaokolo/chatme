import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { ChatAttachment, ChatMessage } from "../types";
import { ReceiptThresholds, getReceiptStatus } from "../utils/messages";
import { MessageBubble } from "./MessageBubble";
import VirtualizedListScrollView from "./VirtualizedListScrollView";

const INITIAL_SCROLL_WINDOW_MS = 800;

export interface MessageListHandle {
  // Jumps to the newest message and keeps following new ones.
  scrollToEnd: (animated?: boolean) => void;
  // Re-pins to the bottom after a layout change (e.g. composer height), only if already there.
  stayAtEnd: () => void;
}

// What the history query is doing, reduced to the states the list renders differently.
export interface HistoryState {
  isLoading: boolean; // first page, nothing to show yet
  isError: boolean; // first page failed, nothing to show
  isRefreshError: boolean; // a refresh failed but older data is still shown
  isLoadingOlder: boolean;
  isOlderError: boolean;
  hasOlder: boolean;
}

interface MessageListProps {
  messages: ChatMessage[];
  history: HistoryState;
  receiptThresholds: ReceiptThresholds;
  bottomInset: number;
  onRetryHistory: () => void;
  onLoadOlder: () => void;
  onMessageOptions: (message: ChatMessage) => void;
  onFailedPress: (message: ChatMessage) => void;
  onImagePress: (message: ChatMessage, attachment: ChatAttachment) => void;
}

export const MessageList = forwardRef<MessageListHandle, MessageListProps>(function MessageList(
  {
    messages,
    history,
    receiptThresholds,
    bottomInset,
    onRetryHistory,
    onLoadOlder,
    onMessageOptions,
    onFailedPress,
    onImagePress,
  },
  ref,
) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isAtEndRef = useRef(true);
  const initialScrollRef = useRef(true);

  useImperativeHandle(
    ref,
    () => ({
      scrollToEnd: (animated = true) => {
        isAtEndRef.current = true;
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
      },
      stayAtEnd: () => {
        if (isAtEndRef.current) requestAnimationFrame(() => listRef.current?.scrollToEnd());
      },
    }),
    [],
  );

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.id === lastMessageIdRef.current) return;
    const isFirstLoad = lastMessageIdRef.current === null;
    lastMessageIdRef.current = last.id;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !isFirstLoad }));
  }, [messages]);

  const hasMessages = messages.length > 0;
  useEffect(() => {
    if (!hasMessages) return;
    const timer = setTimeout(() => {
      initialScrollRef.current = false;
    }, INITIAL_SCROLL_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [hasMessages]);

  const handleLoadOlder = useCallback(() => {
    if (history.hasOlder && !history.isLoadingOlder && !history.isOlderError) onLoadOlder();
  }, [history.hasOlder, history.isLoadingOlder, history.isOlderError, onLoadOlder]);

  if (history.isLoading) {
    return (
      <View style={styles.centered} accessibilityLiveRegion="polite">
        <ActivityIndicator color={theme.buttonPrimary} accessibilityLabel="Loading messages" />
      </View>
    );
  }

  if (history.isError) {
    return (
      <View style={styles.centered}>
        <StyledText weight="medium" style={{ color: theme.textPrimary }}>
          Couldn&apos;t load messages
        </StyledText>
        <RetryButton label="Retry loading messages" onPress={onRetryHistory} />
      </View>
    );
  }

  return (
    <View style={styles.messages}>
      {history.isRefreshError && (
        <View style={styles.banner} accessibilityRole="alert">
          <StyledText size={13} style={{ color: theme.textPrimary, flex: 1 }}>
            Couldn&apos;t refresh. Showing saved messages.
          </StyledText>
          <RetryButton label="Retry refresh" text="Retry" onPress={onRetryHistory} compact />
        </View>
      )}
      <FlatList
        ref={listRef}
        style={styles.messages}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            receiptStatus={
              item.fromMe && item.state === "confirmed"
                ? getReceiptStatus(item, receiptThresholds)
                : undefined
            }
            onLongPress={(m) => (m.state === "failed" ? onFailedPress(m) : onMessageOptions(m))}
            onPress={onFailedPress}
            onImagePress={onImagePress}
          />
        )}
        contentContainerStyle={[styles.messagesContent, !hasMessages && styles.emptyContent]}
        onContentSizeChange={() => {
          if (initialScrollRef.current || isAtEndRef.current) {
            listRef.current?.scrollToEnd({ animated: false });
          }
        }}
        renderScrollComponent={(scrollProps) => (
          <VirtualizedListScrollView
            {...scrollProps}
            offset={bottomInset}
            keyboardLiftBehavior="always"
            onEndVisible={(visible) => {
              isAtEndRef.current = visible;
            }}
          />
        )}
        onStartReached={handleLoadOlder}
        onStartReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.centered}>
            <StyledText style={{ color: theme.textSecondary }}>
              No messages yet. Say hello!
            </StyledText>
          </View>
        }
        ListHeaderComponent={
          history.isLoadingOlder ? (
            <ActivityIndicator
              style={styles.loadingOlder}
              color={theme.buttonPrimary}
              accessibilityLabel="Loading older messages"
            />
          ) : history.isOlderError ? (
            <View style={styles.olderError}>
              <StyledText size={13} style={{ color: theme.textSecondary }}>
                Couldn&apos;t load older messages
              </StyledText>
              <RetryButton label="Retry loading older messages" text="Retry" onPress={onLoadOlder} compact />
            </View>
          ) : null
        }
      />
    </View>
  );
});

const RetryButton = ({
  label,
  text = "Retry",
  onPress,
  compact,
}: {
  label: string;
  text?: string;
  onPress: () => void;
  compact?: boolean;
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ paddingVertical: compact ? 4 : 12, paddingHorizontal: compact ? 8 : 16 }}
    >
      <StyledText weight="bold" style={{ color: theme.buttonPrimary }}>
        {text}
      </StyledText>
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    messages: {
      flex: 1,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 24,
    },
    messagesContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    emptyContent: {
      flexGrow: 1,
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.bgNeutral,
    },
    loadingOlder: {
      paddingVertical: 12,
    },
    olderError: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 8,
    },
  });
