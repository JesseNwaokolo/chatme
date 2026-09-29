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
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getMimeType, uploadMedia } from "@/src/shared/media/mediaApi";
import { markRead } from "../api/messagesApi";
import { useMessages } from "../api/useMessages";
import { useDeleteMessage, useEditMessage, useReactToMessage } from "../api/useMessageActions";
import { useSendMessage } from "../api/useSendMessage";
import { AttachmentPickerSheet } from "../components/AttachmentPickerSheet";
import { MessageActionsModal } from "../components/MessageActionsModal";
import { MessageBubble } from "../components/MessageBubble";
import VirtualizedListScrollView from "../components/VirtualizedListScrollView";
import { useConversationSocket } from "../hooks/useConversationSocket";
import { ChatMessage, PickedMedia } from "../types";
import { applyUnreadCount } from "../utils/applyUnreadCount";
import { getReceiptStatus, toChatMessage, upsertMessages } from "../utils/messages";

interface LocalAttachment {
  type: "image" | "video" | "audio" | "document";
  uri: string;
  contentType: string;
  filename: string;
  sizeBytes?: number;
}

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
  const [showAttachments, setShowAttachments] = useState(false);

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useMessages(id);
  const sendMessageMutation = useSendMessage(id);
  const editMessageMutation = useEditMessage(id);
  const deleteMessageMutation = useDeleteMessage(id);
  const reactMutation = useReactToMessage(id);
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
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

  const dispatchMessage = async ({
    text,
    attachments,
  }: {
    text?: string;
    attachments?: LocalAttachment[];
  }) => {
    const clientMessageId = Crypto.randomUUID();
    setMessages((prev) =>
      upsertMessages(prev, [
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
      ]),
    );

    try {
      const attachmentMediaIds = attachments?.length
        ? await Promise.all(
            attachments.map(async (a) => {
              const media = await uploadMedia({
                uri: a.uri,
                purpose: "message_attachment",
                contentType: a.contentType,
                filename: a.filename,
                sizeBytes: a.sizeBytes,
              });
              return media.id;
            }),
          )
        : undefined;

      const data = await sendMessageMutation.mutateAsync({
        clientMessageId,
        text: text || undefined,
        attachmentMediaIds,
      });
      const myUserId = useUserStore.getState().user?.id;
      setMessages((prev) => upsertMessages(prev, [toChatMessage(data, myUserId)]));
    } catch {
      setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
      Toast.show({
        type: "error",
        text1: "Couldn't send message",
        text2: "Please try again.",
      });
    }
  };

  const applyServerMessage = (data: Parameters<typeof toChatMessage>[0]) => {
    const myUserId = useUserStore.getState().user?.id;
    setMessages((prev) => upsertMessages(prev, [toChatMessage(data, myUserId)]));
  };

  const handleReact = (message: ChatMessage, emoji: string | null) => {
    reactMutation.mutate(
      { messageId: message.id, emoji },
      {
        onSuccess: applyServerMessage,
        onError: () => Toast.show({ type: "error", text1: "Couldn't update reaction" }),
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
            onError: () => Toast.show({ type: "error", text1: "Couldn't delete message" }),
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
      // Attachment captions may be cleared (null); text-only messages need text.
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
          onError: () =>
            Toast.show({
              type: "error",
              text1: "Couldn't edit message",
              text2: "It may have changed. Please try again.",
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
    dispatchMessage({
      attachments: [
        {
          type: "document",
          uri: doc.uri,
          contentType: doc.mimeType ?? getMimeType(doc.name),
          filename: doc.name,
          sizeBytes: doc.size,
        },
      ],
    });
  };

  const handlePickContact = async () => {
    const contact = await Contacts.presentContactPickerAsync();
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

  useEffect(() => {
    if (!isFocused) return;

    const confirmed = messages.filter((m) => m.status !== "sending" && m.status !== "failed");
    const last = confirmed[confirmed.length - 1];
    if (!last) return;

    markRead(id, last.id)
      .then((data) => applyUnreadCount(queryClient, data.conversationId, data.unreadCount))
      .catch(() => {});
  }, [isFocused, messages, id, queryClient]);

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
                ? getReceiptStatus(item, otherReceipt)
                : undefined
            }
            onLongPress={setActionMessage}
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
        <View
          style={[styles.composer, { paddingBottom: insets.bottom + 12 }]}
          onLayout={(e) => setComposerHeight(e.nativeEvent.layout.height)}
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
      </KeyboardStickyView>

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
