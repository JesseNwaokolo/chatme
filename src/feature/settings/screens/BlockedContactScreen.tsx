import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlockedContactRow } from "../components/BlockedContactRow";
import { useBlockedUsers, useUnblockUser } from "@/src/feature/blocks/api/useBlocks";
import Toast from "react-native-toast-message";

const BlockedContactScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: blocked, isLoading, isError, refetch } = useBlockedUsers();
  const unblock = useUnblockUser();

  const confirmUnblock = (userId: string, name: string) => {
    Alert.alert("Unblock contact", `Unblock ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        onPress: () =>
          unblock.mutate(userId, {
            onError: () => Toast.show({ type: "error", text1: "Couldn't unblock contact" }),
          }),
      },
    ]);
  };

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
        data={blocked ?? []}
        keyExtractor={(item) => item.user.id}
        refreshing={false}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const name = item.user.displayName ?? "Unknown";
          return (
            <BlockedContactRow
              contact={{ id: item.user.id, name, avatarUrl: item.user.avatarUrl }}
              onPress={() => confirmUnblock(item.user.id, name)}
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.buttonPrimary} style={{ marginTop: 40 }} />
          ) : (
            <StyledText style={{ color: theme.textSecondary, textAlign: "center", marginTop: 40 }}>
              {isError ? "Couldn't load blocked contacts." : "You haven't blocked anyone."}
            </StyledText>
          )
        }
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
