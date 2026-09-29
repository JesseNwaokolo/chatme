import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useArchivedConversations } from "../api/useArchivedConversations";
import { ChatListItem } from "../components/ChatListItem";
import { Chat } from "../types";

const ArchivedChatScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArchivedConversations();

  const chats = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const hasChats = chats.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <ChevronLeftIcon color={theme.buttonPrimaryText} />
        </Pressable>
        <StyledText weight="bold" size={20} numberOfLines={1} style={styles.title}>
          Archived Chat
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.buttonPrimary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <StyledText style={{ color: theme.textSecondary, textAlign: "center" }}>
            Couldn&apos;t load archived chats.
          </StyledText>
          <Pressable onPress={() => refetch()}>
            <StyledText weight="bold" style={{ color: theme.buttonPrimary }}>
              Try again
            </StyledText>
          </Pressable>
        </View>
      ) : hasChats ? (
        <FlatList
          data={chats}
          keyExtractor={(item: Chat) => item.id}
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
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.loadingMore} color={theme.buttonPrimary} />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centered}>
          <StyledText weight="bold" size={18} style={{ color: theme.textPrimary }}>
            No archived chats
          </StyledText>
        </View>
      )}
    </View>
  );
};

export default ArchivedChatScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    title: {
      flex: 1,
      textAlign: "center",
      color: theme.buttonPrimaryText,
    },
    headerSpacer: {
      width: 24,
      height: 24,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 4,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    loadingMore: {
      paddingVertical: 16,
    },
  });
};
