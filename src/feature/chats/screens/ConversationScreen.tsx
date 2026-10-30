import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import useActiveConversationStore from "@/src/store/useActiveConversationStore";
import { outboxScope } from "@/src/store/useOutboxStore";
import useSocketStore from "@/src/store/useSocketStore";
import useUserStore from "@/src/store/useUserStore";
import { darkTheme } from "@/src/theme/colors";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useAppActive } from "@/src/helpers/useAppActive";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ApiError } from "@/src/api/errors";
import { useIsBlocked, useUnblockUser } from "@/src/feature/blocks/api/useBlocks";
import { markRead } from "../api/messagesApi";
import { chatKeys } from "../api/queryKeys";
import { useConversation } from "../api/useConversation";
import { useMessages } from "../api/useMessages";
import { useReceipts } from "../api/useReceipts";
import { AttachmentPickerSheet } from "../components/AttachmentPickerSheet";
import { ImageViewerModal } from "../components/ImageViewerModal";
import { MessageActionsModal } from "../components/MessageActionsModal";
import { MessageComposer } from "../components/MessageComposer";
import { HistoryState, MessageList, MessageListHandle } from "../components/MessageList";
import { useAttachmentHandlers } from "../hooks/useAttachmentHandlers";
import { useConversationSocket } from "../hooks/useConversationSocket";
import { useMessageDelivery } from "../hooks/useMessageDelivery";
import { useMessageInteractions } from "../hooks/useMessageInteractions";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { Chat, ChatAttachment, ChatMessage, ConfirmedMessage } from "../types";
import { applyUnreadCount } from "../utils/applyUnreadCount";
import { buildMessages, computeReceiptThresholds } from "../utils/messages";

// Coordinates one conversation: wires the history query, delivery, socket and lifecycle
// hooks to the list and composer. Rendering of messages and input lives in those components.
const ConversationScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkTheme = theme === darkTheme;
  // Only `id` is required: opening from a notification passes nothing else, and the other
  // params are just placeholders until the conversation itself has loaded.
  const params = useLocalSearchParams<{
    id: string;
    participantId?: string;
    name?: string;
    avatarUrl?: string;
  }>();
  const { id } = params;

  const listRef = useRef<MessageListHandle>(null);
  const markedReadRef = useRef<string | null>(null);

  const myUserId = useUserStore((s) => s.user?.id);
  const [showAttachments, setShowAttachments] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<ConfirmedMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ConfirmedMessage | null>(null);

  const historyQuery = useMessages(id);
  const { data: historyData, refetch: refetchMessages } = historyQuery;
  const { data: receipts, refetch: refetchReceipts } = useReceipts(id);
  const { data: conversation, error: conversationError } = useConversation(id);
  const identity = useMemo(() => {
    if (conversation?.type === "group") {
      return { participantId: conversation.id, name: conversation.name, avatarUrl: conversation.avatarUrl };
    }
    if (conversation?.type === "direct") {
      const other = conversation.otherParticipant;
      return {
        participantId: other.id,
        name: other.displayName ?? params.name,
        avatarUrl: other.avatarUrl,
      };
    }
    return { participantId: params.participantId, name: params.name, avatarUrl: params.avatarUrl };
  }, [conversation, params.participantId, params.name, params.avatarUrl]);
  const { participantId, name, avatarUrl } = identity;
  const otherUserId =
    conversation?.type === "direct" ? conversation.otherParticipant.id : participantId || null;
  const isBlockedByMe = useIsBlocked(conversation?.type === "group" ? null : otherUserId);
  const unblockUser = useUnblockUser();
  const isFocused = useIsFocused();
  const isSocketConnected = useSocketStore((s) => s.isConnected);
  const queryClient = useQueryClient();
  const isAppActive = useAppActive();
  const isViewing = isFocused && isAppActive;

  const handleConversationGone = useCallback(() => {
    queryClient.setQueryData<Chat[]>(chatKeys.list(), (old) => old?.filter((c) => c.id !== id));
    queryClient.removeQueries({ queryKey: chatKeys.messages(id) });
    queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    Toast.show({ type: "error", text1: "This conversation is no longer available" });
    router.back();
  }, [id, queryClient, router]);

  useEffect(() => {
    if (conversationError instanceof ApiError && conversationError.status === 404) {
      handleConversationGone();
    }
  }, [conversationError, handleConversationGone]);

  const delivery = useMessageDelivery({ conversationId: id, onConversationGone: handleConversationGone });
  const interactions = useMessageInteractions(id, myUserId);
  const { notifyTyping, stopTyping: stopTypingNow } = useTypingIndicator(id, isViewing);
  const { isOtherOnline, isOtherTyping } = useConversationSocket({
    conversationId: id,
    participantId: participantId ?? "",
    onMessageChanged: refetchMessages,
  });

  const history = useMemo(
    () => historyData?.pages.flatMap((page) => page.items) ?? [],
    [historyData],
  );
  const messages = useMemo(
    () => buildMessages(history, delivery.entries, myUserId),
    [history, delivery.entries, myUserId],
  );
  const receiptThresholds = useMemo(
    () => computeReceiptThresholds(receipts?.items, myUserId, messages),
    [receipts, myUserId, messages],
  );
  const viewerImages = useMemo(
    () =>
      messages.flatMap((message) =>
        message.deleted
          ? []
          : (message.attachments ?? [])
              .filter((a) => a.type === "image")
              .map((a, i) => ({
                key: `${message.id}-${i}`,
                url: a.url,
                title: message.fromMe ? "You" : (name ?? "Unknown"),
                subtitle: message.timestamp.toLocaleString(undefined, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              })),
      ),
    [messages, name],
  );

  const hasHistory = !!historyData;
  const historyState: HistoryState = {
    isLoading: historyQuery.isPending && !hasHistory,
    isError: historyQuery.isError && !hasHistory,
    isRefreshError: historyQuery.isRefetchError && !historyQuery.isFetchNextPageError,
    isLoadingOlder: historyQuery.isFetchingNextPage,
    isOlderError: historyQuery.isFetchNextPageError,
    hasOlder: historyQuery.hasNextPage,
  };

  useEffect(() => {
    if (!isViewing || !isSocketConnected) return;
    refetchMessages();
    refetchReceipts();
  }, [isViewing, isSocketConnected, refetchMessages, refetchReceipts]);

  const { reconcile } = delivery;
  useEffect(() => reconcile(history), [history, reconcile]);

  const sendMessage = (payload: Parameters<typeof delivery.send>[0]) => {
    delivery.send(payload);
    listRef.current?.scrollToEnd();
  };

  const attachments = useAttachmentHandlers({
    send: sendMessage,
    closeSheet: () => setShowAttachments(false),
  });

  const handleSubmit = (text: string) => {
    if (editingMessage) {
      interactions.edit(editingMessage, text, () => setEditingMessage(null));
      return;
    }
    stopTypingNow();
    sendMessage({ text });
  };

  const handleFailedPress = (message: ChatMessage) => {
    if (message.state !== "failed") return;
    const { clientMessageId } = message;

    Alert.alert("Message not sent", message.error, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => delivery.discard(clientMessageId) },
      { text: "Retry", onPress: () => delivery.retry(clientMessageId) },
    ]);
  };

  const handleMessageOptions = (message: ChatMessage) => {
    if (message.state === "confirmed") setActionMessage(message);
  };

  const handleImagePress = (message: ChatMessage, attachment: ChatAttachment) => {
    const index = viewerImages.findIndex(
      (image) => image.url === attachment.url && image.key.startsWith(`${message.id}-`),
    );
    if (index !== -1) setViewerIndex(index);
  };

  const lastIncomingId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!m.fromMe && m.state === "confirmed") return m.id;
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (!isViewing || !lastIncomingId || markedReadRef.current === lastIncomingId) return;
    markedReadRef.current = lastIncomingId;

    markRead(id, lastIncomingId)
      .then((data) => applyUnreadCount(queryClient, data.conversationId, data.unreadCount))
      .catch(() => {
        markedReadRef.current = null;
      });
  }, [isViewing, lastIncomingId, id, queryClient]);

  useEffect(() => {
    useActiveConversationStore.getState().setActiveConversationId(isFocused ? id : null);
    return () => {
      if (useActiveConversationStore.getState().activeConversationId === id) {
        useActiveConversationStore.getState().setActiveConversationId(null);
      }
    };
  }, [isFocused, id]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");

      return () => {
        setStatusBarStyle(isDarkTheme ? "light" : "dark");
      };
    }, [isDarkTheme])
  );

  const statusText = isOtherTyping ? "Typing…" : isOtherOnline ? "Online" : "Offline";
  const displayName = name ?? "Unknown";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeftIcon size={24} color={theme.buttonPrimaryText} />
        </Pressable>
        <Pressable
          style={styles.headerIdentity}
          onPress={() => router.push({ pathname: "/chat-profile/[id]", params: { id } })}
          accessibilityRole="button"
          accessibilityLabel={`${displayName}, ${statusText}`}
          accessibilityHint="Opens chat profile"
        >
          <Avatar name={displayName} imageUrl={avatarUrl} size={40} />
          <View style={styles.headerBody}>
            <StyledText weight="bold" numberOfLines={1} style={{ color: theme.buttonPrimaryText }}>
              {displayName}
            </StyledText>
            <StyledText size={13} style={{ color: theme.buttonPrimaryText }}>
              {statusText}
            </StyledText>
          </View>
        </Pressable>
      </View>

      <MessageList
        ref={listRef}
        messages={messages}
        history={historyState}
        receiptThresholds={receiptThresholds}
        bottomInset={insets.bottom}
        onRetryHistory={() => refetchMessages()}
        onLoadOlder={() => historyQuery.fetchNextPage()}
        onMessageOptions={handleMessageOptions}
        onFailedPress={handleFailedPress}
        onImagePress={handleImagePress}
      />

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        {showAttachments && (
          <AttachmentPickerSheet
            onPickMedia={attachments.handlePickMedia}
            onPickDocument={attachments.handlePickDocument}
            onPickContact={attachments.handlePickContact}
            onPickLocation={attachments.handlePickLocation}
          />
        )}
        {isBlockedByMe ? (
          <View style={[styles.blockedBar, { paddingBottom: insets.bottom + 12 }]}>
            <StyledText size={14} style={{ color: theme.textSecondary, flex: 1 }}>
              You blocked this contact.
            </StyledText>
            <Pressable
              hitSlop={8}
              disabled={unblockUser.isPending}
              accessibilityRole="button"
              accessibilityLabel="Unblock contact"
              onPress={() =>
                otherUserId &&
                unblockUser.mutate(otherUserId, {
                  onError: (error) =>
                    Toast.show({
                      type: "error",
                      text1: "Couldn't unblock contact",
                      text2: error instanceof Error ? error.message : undefined,
                    }),
                })
              }
            >
              <StyledText weight="bold" size={14} style={{ color: theme.buttonPrimary }}>
                Unblock
              </StyledText>
            </Pressable>
          </View>
        ) : (
          <MessageComposer
            draftScope={myUserId ? outboxScope(myUserId, id) : null}
            bottomInset={insets.bottom}
            editing={editingMessage ? { text: editingMessage.text } : null}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditingMessage(null)}
            onTyping={notifyTyping}
            onToggleAttachments={() => setShowAttachments((prev) => !prev)}
            onLayout={() => listRef.current?.stayAtEnd()}
          />
        )}
      </KeyboardStickyView>

      <ImageViewerModal
        images={viewerImages}
        startIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />

      <MessageActionsModal
        message={actionMessage}
        myUserId={myUserId}
        onClose={() => setActionMessage(null)}
        onReact={interactions.react}
        onEdit={(message) => message.state === "confirmed" && setEditingMessage(message)}
        onDelete={interactions.confirmDelete}
      />
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
    blockedBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: theme.bgNeutral,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
  });
