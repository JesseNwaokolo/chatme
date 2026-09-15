import { startTyping, stopTyping } from "@/src/api/socket/commands";
import { MessageCreatedEvent } from "@/src/api/socket/types";
import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import {
  ChevronLeftIcon,
  PaperclipIcon,
  PhoneIcon,
  SendIcon,
  VideoCallIcon,
} from "@/src/shared/icons";
import useSocketStore from "@/src/store/useSocketStore";
import useUserStore from "@/src/store/useUserStore";
import { darkTheme } from "@/src/theme/colors";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { markRead } from "../api/messagesApi";
import { useMessages } from "../api/useMessages";
import { useSendMessage } from "../api/useSendMessage";
import { MessageBubble } from "../components/MessageBubble";
import VirtualizedListScrollView from "../components/VirtualizedListScrollView";
import { useConversationSocket } from "../hooks/useConversationSocket";
import { ChatMessage } from "../types";
import { applyUnreadCount } from "../utils/applyUnreadCount";
import { getReceiptStatus, toChatMessage, upsertMessages } from "../utils/messages";

const TYPING_PAUSE_MS = 3000;
const COMPOSER_FALLBACK_HEIGHT = 72;

const ConversationScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkTheme = theme === darkTheme;
  const { id, participantId, name, avatarUrl } = useLocalSearchParams<{
    id: string;
    participantId?: string;
    name?: string;
    avatarUrl?: string;
  }>();

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [composerHeight, setComposerHeight] = useState(COMPOSER_FALLBACK_HEIGHT);

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useMessages(id);
  const sendMessageMutation = useSendMessage(id);
  const isFocused = useIsFocused();
  const isSocketConnected = useSocketStore((s) => s.isConnected);
  const queryClient = useQueryClient();

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTypingNow = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      stopTyping(id).catch(() => {});
    }
  }, [id]);

  useEffect(() => stopTypingNow, [stopTypingNow]);

  useEffect(() => {
    if (!historyData) return;

    const myUserId = useUserStore.getState().user?.id;
    const fetchedMessages = historyData.pages
      .flatMap((page) => page.items)
      .map((item) => toChatMessage(item, myUserId));

    setMessages((prev) => upsertMessages(prev, fetchedMessages));
  }, [historyData]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.id === lastMessageIdRef.current) return;

    const isFirstLoad = lastMessageIdRef.current === null;
    lastMessageIdRef.current = last.id;
    requestAnimationFrame(() => {
      // Reanimated's ScrollView (used under VirtualizedListScrollView) doesn't
      // reliably support scrollToEnd, so scroll to a deliberately oversized
      // offset instead — the native scroll view clamps to the real content
      // bounds regardless of what JS thinks the content height is.
      listRef.current?.scrollToOffset({ offset: 1e7, animated: !isFirstLoad });
    });
  }, [messages]);

  useEffect(() => {
    if (!isFocused || !isSocketConnected) return;
    refetchMessages();
  }, [isFocused, isSocketConnected, refetchMessages]);

  const handleDraftChange = (text: string) => {
    setDraft(text);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(id).catch(() => {});
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTypingNow, TYPING_PAUSE_MS);
  };

  const handleMessageCreated = useCallback((payload: MessageCreatedEvent) => {
    const myUserId = useUserStore.getState().user?.id;
    setMessages((prev) => upsertMessages(prev, [toChatMessage(payload, myUserId)]));
  }, []);

  const { isOtherOnline, isOtherTyping, otherReceipt } = useConversationSocket({
    conversationId: id,
    participantId: participantId ?? "",
    onMessageCreated: handleMessageCreated,
  });

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const clientMessageId = Crypto.randomUUID();
    setMessages((prev) =>
      upsertMessages(prev, [
        {
          id: clientMessageId,
          clientMessageId,
          text,
          fromMe: true,
          timestamp: new Date(),
          status: "sending",
        },
      ]),
    );
    setDraft("");
    stopTypingNow();

    sendMessageMutation.mutate(
      { clientMessageId, text },
      {
        onSuccess: (data) => {
          const myUserId = useUserStore.getState().user?.id;
          setMessages((prev) => upsertMessages(prev, [toChatMessage(data, myUserId)]));
        },
        onError: () => {
          setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
          Toast.show({
            type: "error",
            text1: "Couldn't send message",
            text2: "Please try again.",
          });
        },
      },
    );
  };

  const handleLoadOlder = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  useEffect(() => {
    if (!isFocused) return;

    const confirmed = messages.filter((m) => m.status !== "sending" && m.status !== "failed");
    const last = confirmed[confirmed.length - 1];
    if (!last) return;

    markRead(id, last.id)
      .then((data) => applyUnreadCount(queryClient, data.conversationId, data.unreadCount))
      .catch(() => {});
  }, [isFocused, messages, id, queryClient]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");

      return () => {
        setStatusBarStyle(isDarkTheme ? "light" : "dark");
      };
    }, [isDarkTheme])
  );

  const statusText = isOtherTyping ? "Typing…" : isOtherOnline ? "Online" : "Offline";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeftIcon size={24} color={theme.buttonPrimaryText} />
        </Pressable>
        <Pressable
          style={styles.headerIdentity}
          onPress={() => router.push({ pathname: "/chat-profile/[id]", params: { id } })}
        >
          <Avatar name={name ?? "Unknown"} imageUrl={avatarUrl} size={40} />
          <View style={styles.headerBody}>
            <StyledText weight="bold" numberOfLines={1} style={{ color: theme.buttonPrimaryText }}>
              {name ?? "Unknown"}
            </StyledText>
            <StyledText size={13} style={{ color: theme.buttonPrimaryText }}>
              {statusText}
            </StyledText>
          </View>
        </Pressable>
        <Pressable hitSlop={12}>
          <VideoCallIcon size={24} color={theme.buttonPrimaryText} />
        </Pressable>
        <Pressable hitSlop={12}>
          <PhoneIcon size={22} color={theme.buttonPrimaryText} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        style={styles.messages}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            receiptStatus={
              item.fromMe && item.status !== "sending" && item.status !== "failed"
                ? getReceiptStatus(item, otherReceipt)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.messagesContent}
        renderScrollComponent={(scrollProps) => (
          <VirtualizedListScrollView {...scrollProps} offset={composerHeight} />
        )}
        onStartReached={handleLoadOlder}
        onStartReachedThreshold={0.3}
        ListHeaderComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.loadingOlder} color={theme.buttonPrimary} />
          ) : null
        }
      />

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View
          style={[styles.composer, { paddingBottom: insets.bottom + 12 }]}
          onLayout={(e) => setComposerHeight(e.nativeEvent.layout.height)}
        >
          <Pressable hitSlop={8}>
            <PaperclipIcon size={22} color={theme.textSecondary} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={handleDraftChange}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary }]}
            multiline
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: theme.buttonPrimary }]}
            onPress={handleSend}
            hitSlop={8}
          >
            <SendIcon size={18} color={theme.buttonPrimaryText} />
          </Pressable>
        </View>
      </KeyboardStickyView>
    </View>
  );
};

export default ConversationScreen;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgPrimaryLighter,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: theme.buttonPrimary,
    },
    headerIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerBody: {
      flex: 1,
      gap: 2,
    },
    messages: {
      flex: 1,
    },
    messagesContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    loadingOlder: {
      paddingVertical: 12,
    },
    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: theme.bgNeutral,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    input: {
      flex: 1,
      fontSize: 16,
      maxHeight: 120,
      paddingVertical: 8,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
