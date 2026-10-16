import { startTyping, stopTyping } from "@/src/api/socket/commands";
import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import {
  ChevronLeftIcon,
  PaperclipIcon,
  PhoneIcon,
  SendIcon,
  VideoCallIcon,
} from "@/src/shared/icons";
import useActiveConversationStore from "@/src/store/useActiveConversationStore";
import useSocketStore from "@/src/store/useSocketStore";
import useUserStore from "@/src/store/useUserStore";
import { darkTheme } from "@/src/theme/colors";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Contacts from "expo-contacts";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getMimeType, resolveContentType, uploadMedia } from "@/src/shared/media/mediaApi";
import { ApiError } from "@/src/api/errors";
import { useIsBlocked, useUnblockUser } from "@/src/feature/blocks/api/useBlocks";
import { getConversation } from "../api/chatsApi";
import { markRead } from "../api/messagesApi";
import { chatKeys } from "../api/queryKeys";
import { MessageResponse } from "../api/types";
import { useConversation } from "../api/useConversation";
import { useMessages } from "../api/useMessages";
import { useReceipts } from "../api/useReceipts";
import { useDeleteMessage, useEditMessage, useReactToMessage } from "../api/useMessageActions";
import { useSendMessage } from "../api/useSendMessage";
import { AttachmentPickerSheet } from "../components/AttachmentPickerSheet";
import { MessageActionsModal } from "../components/MessageActionsModal";
import { ImageViewerModal } from "../components/ImageViewerModal";
import { MessageBubble } from "../components/MessageBubble";
import VirtualizedListScrollView from "../components/VirtualizedListScrollView";
import { useConversationSocket } from "../hooks/useConversationSocket";
import { Chat, ChatAttachment, ChatMessage, PickedMedia } from "../types";
import { applyUnreadCount } from "../utils/applyUnreadCount";
import { patchMessageInCache, upsertMessageInCache } from "../utils/messageCache";
import { buildMessages, computeReceiptThresholds, getReceiptStatus } from "../utils/messages";

interface LocalAttachment {
  type: "image" | "video" | "audio" | "document";
  uri: string;
  contentType: string;
  filename: string;
  sizeBytes?: number;
}

interface OutboxItem {
  text?: string;
  attachments?: LocalAttachment[];
  mediaIds?: string[];
}

const TYPING_PAUSE_MS = 3000;

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
  const isAtEndRef = useRef(true);
  const markedReadRef = useRef<string | null>(null);
  const outboxRef = useRef(new Map<string, OutboxItem>());

  const myUserId = useUserStore((s) => s.user?.id);
  const [pending, setPending] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useMessages(id);
  const { data: receipts, refetch: refetchReceipts } = useReceipts(id);
  const { data: conversation, error: conversationError } = useConversation(id);
  const otherUserId =
    conversation?.type === "direct" ? conversation.otherParticipant.id : participantId || null;
  const isBlockedByMe = useIsBlocked(conversation?.type === "group" ? null : otherUserId);
  const unblockUser = useUnblockUser();
  const initialScrollRef = useRef(true);
  const sendMessageMutation = useSendMessage(id);
  const editMessageMutation = useEditMessage(id);
  const deleteMessageMutation = useDeleteMessage(id);
  const reactMutation = useReactToMessage(id);
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const isFocused = useIsFocused();
  const isSocketConnected = useSocketStore((s) => s.isConnected);
  const queryClient = useQueryClient();

  const history = useMemo(
    () => historyData?.pages.flatMap((page) => page.items) ?? [],
    [historyData],
  );
  const messages = useMemo(
    () => buildMessages(history, pending, myUserId),
    [history, pending, myUserId],
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
    const last = messages[messages.length - 1];
    if (!last || last.id === lastMessageIdRef.current) return;

    const isFirstLoad = lastMessageIdRef.current === null;
    lastMessageIdRef.current = last.id;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: !isFirstLoad });
    });
  }, [messages]);

  const hasMessages = messages.length > 0;
  useEffect(() => {
    if (!hasMessages) return;
    const timer = setTimeout(() => {
      initialScrollRef.current = false;
    }, 800);
    return () => clearTimeout(timer);
  }, [hasMessages]);

  useEffect(() => {
    if (!isFocused || !isSocketConnected) return;
    refetchMessages();
    refetchReceipts();
  }, [isFocused, isSocketConnected, refetchMessages, refetchReceipts]);

  const handleDraftChange = (text: string) => {
    setDraft(text);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(id).catch(() => {});
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTypingNow, TYPING_PAUSE_MS);
  };

  const { isOtherOnline, isOtherTyping } = useConversationSocket({
    conversationId: id,
    participantId: participantId ?? "",
    onMessageChanged: refetchMessages,
  });

  const updatePending = (clientMessageId: string, patch: Partial<ChatMessage> | null) =>
    setPending((prev) =>
      patch
        ? prev.map((m) => (m.clientMessageId === clientMessageId ? { ...m, ...patch } : m))
        : prev.filter((m) => m.clientMessageId !== clientMessageId),
    );

  const deliver = async (clientMessageId: string) => {
    const item = outboxRef.current.get(clientMessageId);
    if (!item) return;
    updatePending(clientMessageId, { status: "sending" });

    try {
      if (!item.mediaIds && item.attachments?.length) {
        item.mediaIds = await Promise.all(
          item.attachments.map(async (a) => {
            const media = await uploadMedia({
              uri: a.uri,
              purpose: "message_attachment",
              contentType: a.contentType,
              filename: a.filename,
              sizeBytes: a.sizeBytes,
            });
            return media.id;
          }),
        );
      }

      const data = await sendMessageMutation.mutateAsync({
        clientMessageId,
        text: item.text || undefined,
        attachmentMediaIds: item.mediaIds,
      });
      outboxRef.current.delete(clientMessageId);
      upsertMessageInCache(queryClient, data);
      updatePending(clientMessageId, null);
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const stillExists = await getConversation(id).then(
          () => true,
          (err) => !(err instanceof ApiError && err.status === 404),
        );
        if (!stillExists) {
          outboxRef.current.delete(clientMessageId);
          updatePending(clientMessageId, null);
          handleConversationGone();
          return;
        }
        updatePending(clientMessageId, { status: "failed" });
        Toast.show({
          type: "error",
          text1: "Can't message this contact",
          text2: "One of you may have blocked the other.",
        });
        return;
      }
      console.log("[conversation] send failed:", error);
      updatePending(clientMessageId, { status: "failed" });
      Toast.show({
        type: "error",
        text1: "Couldn't send message",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const dispatchMessage = ({
    text,
    attachments,
  }: {
    text?: string;
    attachments?: LocalAttachment[];
  }) => {
    const clientMessageId = Crypto.randomUUID();
    outboxRef.current.set(clientMessageId, { text, attachments });
    setPending((prev) => [
      ...prev,
      {
        id: clientMessageId,
        clientMessageId,
        text: text ?? "",
        attachments: attachments?.map((a) => ({
          type: a.type,
          url: a.uri,
          filename: a.filename,
          contentType: a.contentType,
        })),
        fromMe: true,
        timestamp: new Date(),
        status: "sending",
      },
    ]);
    isAtEndRef.current = true;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    deliver(clientMessageId);
  };

  const handleFailedPress = (message: ChatMessage) => {
    const clientMessageId = message.clientMessageId;
    if (message.status !== "failed" || !clientMessageId) return;

    Alert.alert("Message not sent", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          outboxRef.current.delete(clientMessageId);
          updatePending(clientMessageId, null);
        },
      },
      { text: "Retry", onPress: () => deliver(clientMessageId) },
    ]);
  };

  const applyServerMessage = (data: MessageResponse) => upsertMessageInCache(queryClient, data);

  const handleReact = (message: ChatMessage, emoji: string | null) => {
    if (!myUserId) return;

    const previousReactions = message.reactions ?? [];
    const nextReactions = [
      ...previousReactions.filter((r) => r.userId !== myUserId),
      ...(emoji ? [{ userId: myUserId, emoji }] : []),
    ];
    const setReactions = (reactions: ChatMessage["reactions"]) =>
      patchMessageInCache(queryClient, id, message.id, (m) => ({ ...m, reactions }));

    setReactions(nextReactions);
    reactMutation.mutate(
      { messageId: message.id, emoji },
      {
        onSuccess: (data) => {
          if (data.reactions) applyServerMessage(data);
        },
        onError: (error) => {
          setReactions(previousReactions);
          Toast.show({
            type: "error",
            text1: "Couldn't update reaction",
            text2: error instanceof Error ? error.message : undefined,
          });
        },
      },
    );
  };

  const handleDeleteMessage = (message: ChatMessage) => {
    Alert.alert("Delete message", "This deletes the message for everyone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMessageMutation.mutate(message.id, {
            onSuccess: applyServerMessage,
            onError: (error) =>
              Toast.show({
                type: "error",
                text1: "Couldn't delete message",
                text2: error instanceof Error ? error.message : undefined,
              }),
          }),
      },
    ]);
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage(message);
    setDraft(message.text);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setDraft("");
  };

  const handleSend = () => {
    const text = draft.trim();

    if (editingMessage) {
      if (!text && !editingMessage.attachments?.length) return;
      editMessageMutation.mutate(
        {
          messageId: editingMessage.id,
          text: text || null,
          expectedVersion: editingMessage.version ?? 0,
        },
        {
          onSuccess: (data) => {
            applyServerMessage(data);
            cancelEdit();
          },
          onError: (error) =>
            Toast.show({
              type: "error",
              text1: "Couldn't edit message",
              text2: error instanceof Error ? error.message : "Please try again.",
            }),
        },
      );
      return;
    }

    if (!text) return;

    setDraft("");
    stopTypingNow();
    dispatchMessage({ text });
  };

  const handleImagePress = (message: ChatMessage, attachment: ChatAttachment) => {
    const index = viewerImages.findIndex(
      (image) => image.url === attachment.url && image.key.startsWith(`${message.id}-`),
    );
    if (index !== -1) setViewerIndex(index);
  };

  const handleLoadOlder = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const handlePickMedia = (items: PickedMedia[]) => {
    setShowAttachments(false);
    if (items.length === 0) return;

    const hasVideo = items.some((item) => item.kind === "video");
    if (hasVideo && items.length > 1) {
      Toast.show({
        type: "info",
        text1: "Send one video at a time",
        text2: "Videos can't be combined with other media.",
      });
      return;
    }

    dispatchMessage({
      attachments: items.map((item) => {
        const contentType =
          item.mimeType ?? (item.kind === "video" ? "video/mp4" : getMimeType(item.uri));
        const extension = contentType.split("/")[1] ?? "jpg";
        return {
          type: item.kind,
          uri: item.uri,
          contentType,
          filename: item.fileName ?? `${item.kind}-${Date.now()}.${extension}`,
          sizeBytes: item.fileSize,
        };
      }),
    });
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    setShowAttachments(false);
    if (result.canceled) return;

    const doc = result.assets[0];
    let contentType: string;
    try {
      contentType = resolveContentType(doc.name, doc.mimeType);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Unsupported file",
        text2: error instanceof Error ? error.message : undefined,
      });
      return;
    }
    dispatchMessage({
      attachments: [
        {
          type: "document",
          uri: doc.uri,
          contentType,
          filename: doc.name,
          sizeBytes: doc.size,
        },
      ],
    });
  };

  const handlePickContact = async () => {
    let contact: Contacts.ExistingContact | null = null;
    try {
      contact = await Contacts.presentContactPickerAsync();
    } catch (error) {
      console.log("[conversation] contact picker failed:", error);
      Toast.show({
        type: "error",
        text1: "Couldn't open contacts",
        text2: error instanceof Error ? error.message : undefined,
      });
    }
    setShowAttachments(false);
    if (!contact) return;

    const name = contact.name ?? "Contact";
    const numbers = (contact.phoneNumbers ?? []).map((p) => p.number).filter(Boolean);
    dispatchMessage({ text: [`👤 ${name}`, ...numbers].join("\n") });
  };

  const handlePickLocation = async () => {
    setShowAttachments(false);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Location permission needed",
        text2: "Allow location access to share where you are.",
      });
      return;
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      dispatchMessage({
        text: `📍 My location\nhttps://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
      });
    } catch {
      Toast.show({ type: "error", text1: "Couldn't get your location" });
    }
  };

  const lastIncomingId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!m.fromMe && !m.status) return m.id;
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (!isFocused || !lastIncomingId || markedReadRef.current === lastIncomingId) return;
    markedReadRef.current = lastIncomingId;

    markRead(id, lastIncomingId)
      .then((data) => applyUnreadCount(queryClient, data.conversationId, data.unreadCount))
      .catch(() => {
        markedReadRef.current = null;
      });
  }, [isFocused, lastIncomingId, id, queryClient]);

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
                ? getReceiptStatus(item, receiptThresholds)
                : undefined
            }
            onLongPress={(m) => (m.status === "failed" ? handleFailedPress(m) : setActionMessage(m))}
            onPress={handleFailedPress}
            onImagePress={handleImagePress}
          />
        )}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => {
          if (initialScrollRef.current || isAtEndRef.current) {
            listRef.current?.scrollToEnd({ animated: false });
          }
        }}
        renderScrollComponent={(scrollProps) => (
          <VirtualizedListScrollView
            {...scrollProps}
            offset={insets.bottom}
            keyboardLiftBehavior="always"
            onEndVisible={(visible) => {
              isAtEndRef.current = visible;
            }}
          />
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
        {showAttachments && (
          <AttachmentPickerSheet
            onPickMedia={handlePickMedia}
            onPickDocument={handlePickDocument}
            onPickContact={handlePickContact}
            onPickLocation={handlePickLocation}
          />
        )}
        {editingMessage && (
          <View style={styles.editBanner}>
            <StyledText size={13} weight="medium" style={{ color: theme.textSecondary, flex: 1 }}>
              Editing message
            </StyledText>
            <Pressable hitSlop={8} onPress={cancelEdit}>
              <StyledText size={13} weight="bold" style={{ color: theme.buttonPrimary }}>
                Cancel
              </StyledText>
            </Pressable>
          </View>
        )}
        {isBlockedByMe ? (
          <View style={[styles.composer, styles.blockedBar, { paddingBottom: insets.bottom + 12 }]}>
            <StyledText size={14} style={{ color: theme.textSecondary, flex: 1 }}>
              You blocked this contact.
            </StyledText>
            <Pressable
              hitSlop={8}
              disabled={unblockUser.isPending}
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
        <View
          style={[styles.composer, { paddingBottom: insets.bottom + 12 }]}
          onLayout={() => {
            if (isAtEndRef.current) requestAnimationFrame(() => listRef.current?.scrollToEnd());
          }}
        >
          <Pressable hitSlop={8} onPress={() => setShowAttachments((prev) => !prev)}>
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
        )}
      </KeyboardStickyView>

      <ImageViewerModal
        images={viewerImages}
        startIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />

      <MessageActionsModal
        message={actionMessage}
        myUserId={useUserStore.getState().user?.id}
        onClose={() => setActionMessage(null)}
        onReact={handleReact}
        onEdit={handleStartEdit}
        onDelete={handleDeleteMessage}
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
    messages: {
      flex: 1,
    },
    editBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.bgNeutral,
    },
    messagesContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
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
    blockedBar: {
      alignItems: "center",
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
