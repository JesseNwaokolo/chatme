import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, SearchIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StarredMessageItem } from "../components/StarredMessageItem";
import { mockStarredMessages } from "../data/mockStarredMessages";

const StarMessagesScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <ChevronLeftIcon color={theme.buttonPrimaryText} />
        </Pressable>
        <StyledText
          weight="bold"
          size={20}
          numberOfLines={1}
          style={styles.title}
        >
          Star Message
        </StyledText>
        <Pressable onPress={() => {}} hitSlop={20}>
          <SearchIcon size={22} color={theme.buttonPrimaryText} />
        </Pressable>
      </View>

      <FlatList
        data={mockStarredMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <StarredMessageItem message={item} onPress={() => {}} />
        )}
      />
    </View>
  );
};

export default StarMessagesScreen;

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
    listContent: {
      padding: 24,
    },
    separator: {
      height: 24,
    },
  });
};
