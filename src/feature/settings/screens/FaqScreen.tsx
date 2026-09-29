import { getLineHeight } from "@/src/helpers/lineHeight";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, SearchIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FaqRow } from "../components/FaqRow";
import { mockFaqItems } from "../data/mockFaqItems";

const FaqScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(mockFaqItems[0]?.id ?? null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return mockFaqItems;
    return mockFaqItems.filter((item) => item.question.toLowerCase().includes(trimmed));
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => router.back()} hitSlop={20}>
            <ChevronLeftIcon color={theme.buttonPrimaryText} />
          </Pressable>
          <StyledText weight="bold" size={20} numberOfLines={1} style={styles.title}>
            FAQ
          </StyledText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchBar}>
          <SearchIcon color="rgba(255,255,255,0.8)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search questions ..."
            placeholderTextColor="#FFFFFFE5"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FaqRow
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
          />
        )}
      />
    </View>
  );
};

export default FaqScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    header: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 24,
      paddingBottom: 20,
      gap: 20,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 24,
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
      paddingHorizontal: 24,
    },
  });
};
