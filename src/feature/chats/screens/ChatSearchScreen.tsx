import { useDebouncedValue } from "@/src/helpers/useDebouncedValue";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, SearchIcon } from "@/src/shared/icons";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageResponse } from "../api/types";
import { useSearchMessages } from "../api/useSearchMessages";

const HIGHLIGHT_CONTEXT = 40;

const formatResultDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/** Splits text around the first match so the match can be rendered in bold. */
const splitAroundMatch = (text: string, query: string) => {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return { before: text, match: "", after: "" };

  const start = Math.max(0, index - HIGHLIGHT_CONTEXT);
  return {
    before: (start > 0 ? "…" : "") + text.slice(start, index),
    match: text.slice(index, index + query.length),
    after: text.slice(index + query.length),
  };
};

const ChatSearchScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const myUserId = useUserStore((s) => s.user?.id);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const { data, isFetching, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchMessages(id, debouncedQuery);

  const results = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const isSearching = debouncedQuery.length > 0;

  const renderResult = ({ item }: { item: MessageResponse }) => {
    const { before, match, after } = splitAroundMatch(item.text ?? "", debouncedQuery);
    return (
      <View style={styles.result}>
        <View style={styles.resultTop}>
          <StyledText size={13} weight="bold" style={{ color: theme.buttonPrimary }}>
            {item.senderId === myUserId ? "You" : "Them"}
          </StyledText>
          <StyledText size={12} style={{ color: theme.textSecondary }}>
            {formatResultDate(item.createdAt)}
          </StyledText>
        </View>
        <StyledText numberOfLines={3} style={{ color: theme.textPrimary }}>
          {before}
          <StyledText weight="bold" style={{ color: theme.buttonPrimary }}>
            {match}
          </StyledText>
          {after}
        </StyledText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <ChevronLeftIcon color={theme.buttonPrimaryText} />
        </Pressable>
        <View style={styles.searchBar}>
          <SearchIcon size={18} color="#FFFFFFB3" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search in chat..."
            placeholderTextColor="#FFFFFFB3"
            autoFocus
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.buttonPrimaryText }]}
          />
        </View>
      </View>

      {!isSearching ? (
        <View style={styles.centered}>
          <StyledText style={{ color: theme.textSecondary, textAlign: "center" }}>
            Search for messages and captions in this chat.
          </StyledText>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <StyledText style={{ color: theme.textSecondary }}>Couldn&apos;t search messages.</StyledText>
        </View>
      ) : isFetching && results.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.buttonPrimary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <StyledText weight="bold" size={18}>
                No results
              </StyledText>
              <StyledText style={{ color: theme.textSecondary }}>
                Nothing matches &quot;{debouncedQuery}&quot;.
              </StyledText>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} color={theme.buttonPrimary} />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default ChatSearchScreen;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 44,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#FFFFFF29",
    },
    searchInput: {
      flex: 1,
      padding: 0,
      fontSize: 16,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingVertical: 8,
      flexGrow: 1,
    },
    result: {
      gap: 6,
      paddingVertical: 14,
    },
    resultTop: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 24,
    },
  });
