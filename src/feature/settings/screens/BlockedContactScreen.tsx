import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlockedContactRow } from "../components/BlockedContactRow";
import { mockBlockedContacts } from "../data/mockBlockedContacts";

const BlockedContactScreen = () => {
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
          Blocked Contact
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={mockBlockedContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BlockedContactRow contact={item} onPress={() => {}} />
        )}
        ListFooterComponent={
          <StyledText size={13} style={styles.caption}>
            Blocked contacts can&apos;t send messages and call you.
          </StyledText>
        }
      />
    </View>
  );
};

export default BlockedContactScreen;

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
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    caption: {
      color: theme.textSecondary,
      marginTop: 4,
    },
  });
};
