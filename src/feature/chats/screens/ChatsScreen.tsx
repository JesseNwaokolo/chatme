import { StyledText } from "@/src/shared/components/StyledText";
import { SearchIcon } from "@/src/shared/icons";
import { darkTheme } from "@/src/theme/colors";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddPinModal from "../components/AddPinModal";
import { ChatListItem } from "../components/ChatListItem";
import { EmptyChatsState } from "../components/EmptyChatsState";
import { NewChatFab } from "../components/NewChatFab";
import { getLineHeight } from "@/src/helpers/lineHeight";
import {
  mockChats,
  suggestedContacts,
  suggestedContactsOverflowCount,
} from "../data/mockChats";
import { Chat } from "../types";

const ChatsScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);
  const router = useRouter();
  
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const visibleChats = useMemo(
    () =>
      chats
        .filter((chat) => !chat.archived)
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)),
    [chats]
  );
  const hasChats = visibleChats.length > 0;

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
        <StyledText
          weight="bold"
          size={24}
          style={{
            color: hasChats ? theme.buttonPrimaryText : theme.textPrimary,
          }}
        >
          Chats
        </StyledText>
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

      {hasChats ? (
        <FlatList
          data={visibleChats}
          keyExtractor={(item: Chat) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
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
        <EmptyChatsState
          contacts={suggestedContacts}
          overflowCount={suggestedContactsOverflowCount}
        />
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
  });
};
