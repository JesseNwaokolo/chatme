import { StyledText } from "@/src/shared/components/StyledText";
import { SearchIcon } from "@/src/shared/icons";
import { darkTheme } from "@/src/theme/colors";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddPinModal from "../components/AddPinModal";
import { ChatListItem } from "../components/ChatListItem";
import { EmptyChatsState } from "../components/EmptyChatsState";
import { NewChatFab } from "../components/NewChatFab";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { useChats } from "../api/useChats";
import { useVisiblePresence } from "../hooks/useVisiblePresence";
import { Chat } from "../types";

const VIEWPORT_BUFFER_ITEMS = 3;
const VISIBILITY_DEBOUNCE_MS = 300;
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 10 };

const ChatsScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);
  const router = useRouter();

  const { data: conversations, isLoading, isError, refetch } = useChats();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!conversations) return;
    setChats((prev) =>
      conversations.map((chat) => {
        const existing = prev.find((p) => p.id === chat.id);
        return existing
          ? {
              ...chat,
              muted: existing.muted,
              pinned: existing.pinned,
              archived: existing.archived,
            }
          : chat;
      })
    );
  }, [conversations]);

  const visibleChats = useMemo(
    () =>
      chats
        .filter((chat) => !chat.archived)
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)),
    [chats]
  );
  const hasChats = visibleChats.length > 0;

  const { onlineByConversationId, updateVisible } = useVisiblePresence();
  const visibleChatsRef = useRef(visibleChats);
  visibleChatsRef.current = visibleChats;
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const indices = viewableItems
        .map((v) => v.index)
        .filter((i): i is number => i !== null);
      if (indices.length === 0) return;

      const list = visibleChatsRef.current;
      const minIndex = Math.max(0, Math.min(...indices) - VIEWPORT_BUFFER_ITEMS);
      const maxIndex = Math.min(list.length - 1, Math.max(...indices) + VIEWPORT_BUFFER_ITEMS);
      const windowed = list
        .slice(minIndex, maxIndex + 1)
        .map((chat) => ({ conversationId: chat.id, participantId: chat.participantId }));

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => updateVisible(windowed), VISIBILITY_DEBOUNCE_MS);
    }
  ).current;

  const chatsWithPresence = useMemo(
    () =>
      visibleChats.map((chat) => ({
        ...chat,
        online: onlineByConversationId[chat.id] ?? chat.online,
      })),
    [visibleChats, onlineByConversationId]
  );

  const hasPin = false;
  const [showPinModal, setShowPinModal] = useState(false);
  const isDarkTheme = theme === darkTheme;

  useEffect(() => {
    if (!hasPin) {
      setShowPinModal(true);
    }
  }, [hasPin]);

  const toggleMute = (id: string) =>
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, muted: !chat.muted } : chat
      )
    );

  const togglePinned = (id: string) =>
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat
      )
    );

  const toggleArchived = (id: string) =>
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, archived: !chat.archived } : chat
      )
    );

  const deleteChat = (id: string) =>
    setChats((prev) => prev.filter((chat) => chat.id !== id));

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(hasChats ? "light" : isDarkTheme ? "light" : "dark");
      refetch();

      return () => {
        setStatusBarStyle(isDarkTheme ? "light" : "dark");
      };
    }, [hasChats, isDarkTheme])
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          hasChats && styles.headerPopulated,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <Pressable onLongPress={() => router.push("/socket-debug")}>
          <StyledText
            weight="bold"
            size={24}
            style={{
              color: hasChats ? theme.buttonPrimaryText : theme.textPrimary,
            }}
          >
            Chats
          </StyledText>
        </Pressable>
        {hasChats && (
          <View style={styles.searchBar}>
            <SearchIcon color="rgba(255,255,255,0.8)" />
            <TextInput
              placeholder="Search chat, people and more..."
              placeholderTextColor="#FFFFFFE5"
              style={styles.searchInput}
            />
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.buttonPrimary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <StyledText style={{ color: theme.textSecondary, textAlign: "center" }}>
            Couldn&apos;t load your chats.
          </StyledText>
          <Pressable onPress={() => refetch()}>
            <StyledText weight="bold" style={{ color: theme.buttonPrimary }}>
              Try again
            </StyledText>
          </Pressable>
        </View>
      ) : hasChats ? (
        <FlatList
          data={chatsWithPresence}
          keyExtractor={(item: Chat) => item.id}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              onPress={() =>
                router.push({
                  pathname: "/conversation/[id]",
                  params: {
                    id: item.id,
                    participantId: item.participantId,
                    name: item.name,
                    avatarUrl: item.avatarUrl ?? "",
                  },
                })
              }
              onToggleMute={() => toggleMute(item.id)}
              onTogglePinned={() => togglePinned(item.id)}
              onDelete={() => deleteChat(item.id)}
              onToggleArchived={() => toggleArchived(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyChatsState />
      )}

      <NewChatFab />

      <AddPinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={() => router.push("/setup-pin")}
      />
    </View>
  );
};

export default ChatsScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    header: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      gap: 20,
    },
    headerPopulated: {
      backgroundColor: theme.buttonPrimary,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 48,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#FFFFFF29",
      backgroundColor: "#FFFFFF0F",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.buttonPrimaryText,
      lineHeight: getLineHeight(16),
    },
    listContent: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 100,
      gap : 4
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
  });
};
