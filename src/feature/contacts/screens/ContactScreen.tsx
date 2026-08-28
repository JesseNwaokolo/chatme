import { useDebouncedValue } from "@/src/helpers/useDebouncedValue";
import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, SearchIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateDirectConversation } from "../api/useCreateDirectConversation";
import { useMatchContacts } from "../api/useMatchContacts";
import { MIN_SEARCH_QUERY_LENGTH, useSearchUsers } from "../api/useSearchUsers";
import { useDeviceContacts } from "../hooks/useDeviceContacts";
import { ContactRow, SearchResultRow } from "../types";
import { buildContactSections } from "../utils/buildContactSections";
import { normalizePhoneNumber } from "../utils/normalizePhoneNumber";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const ContactScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const isSearching = debouncedQuery.length > 0;
  const queryTooShort =
    isSearching && debouncedQuery.length < MIN_SEARCH_QUERY_LENGTH;

  const { status: contactsStatus, contacts } = useDeviceContacts();
  const phoneNumbers = useMemo(
    () => contacts.flatMap((c) => c.phoneNumbers.map(normalizePhoneNumber)),
    [contacts],
  );
  const { data: matchData, error, isError, isLoading: isMatching } =
    useMatchContacts(phoneNumbers);

  const { data: searchData, isLoading: isSearchLoading } =
    useSearchUsers(debouncedQuery);

  const createConversation = useCreateDirectConversation();

  const { sections, matchesByUserId } = useMemo(
    () => buildContactSections(contacts, matchData?.matches ?? []),
    [contacts, matchData],
  );

  const searchResults: SearchResultRow[] = useMemo(
    () =>
      (searchData?.items ?? []).map((item) => {
        const contactMatch = matchesByUserId.get(item.id);
        return {
          id: item.id,
          displayName: item.displayName,
          avatarUrl: item.avatarUrl,
          phoneNumber: contactMatch?.phoneNumber,
          inContacts: !!contactMatch,
        };
      }),
    [searchData, matchesByUserId],
  );

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 280 });
    overlayOpacity.value = withTiming(1, { duration: 280 });
  }, [overlayOpacity, translateY]);

  const dismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 220 },
      (finished) => {
        if (finished) runOnJS(router.back)();
      },
    );
  };

  const handleStartChat = (participantId: string) => {
    createConversation.mutate(participantId, { onSuccess: () => dismiss() });
  };

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderContactRow = ({ item }: { item: ContactRow }) => {
    const isMatched = !!item.matchedUser;
    return (
      <Pressable
        style={styles.row}
        disabled={!isMatched}
        onPress={() =>
          isMatched && item.matchedUser && handleStartChat(item.matchedUser.id)
        }
      >
        <Avatar name={item.name} imageUrl={item.imageUri} size={44} />
        <View style={styles.body}>
          <StyledText
            weight="bold"
            numberOfLines={1}
            style={{
              color: isMatched ? theme.buttonPrimary : theme.textPrimary,
            }}
          >
            {item.name}
          </StyledText>
          {!!item.phoneNumber && (
            <StyledText size={13} style={{ color: theme.textSecondary }}>
              {item.phoneNumber}
            </StyledText>
          )}
        </View>
        {isMatched ? (
          <View style={styles.chevron}>
            <ChevronLeftIcon size={18} color={theme.textSecondary} />
          </View>
        ) : (
          <StyledText
            size={14}
            weight="medium"
            style={{ color: theme.textTertiary }}
          >
            Invite
          </StyledText>
        )}
      </Pressable>
    );
  };

  const renderSearchRow = ({ item }: { item: SearchResultRow }) => (
    <Pressable style={styles.row} onPress={() => handleStartChat(item.id)}>
      <Avatar
        name={item.displayName ?? "?"}
        imageUrl={item.avatarUrl}
        size={44}
      />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <StyledText
            weight="bold"
            numberOfLines={1}
            style={{ color: theme.textPrimary }}
          >
            {item.displayName ?? "Unknown"}
          </StyledText>
          {item.inContacts && (
            <View style={styles.tag}>
              <StyledText
                size={11}
                weight="bold"
                style={{ color: theme.buttonPrimaryText }}
              >
                In your contacts
              </StyledText>
            </View>
          )}
        </View>
        {!!item.phoneNumber && (
          <StyledText size={13} style={{ color: theme.textSecondary }}>
            {item.phoneNumber}
          </StyledText>
        )}
      </View>
      <View style={styles.chevron}>
        <ChevronLeftIcon size={18} color={theme.textSecondary} />
      </View>
    </Pressable>
  );

  const showLoading =
    contactsStatus === "loading" ||
    (contactsStatus === "granted" && isMatching && sections.length === 0);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss}>
        <Animated.View style={[styles.overlay, overlayAnimStyle]} />
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          { paddingTop: insets.top > 0 ? 12 : 24 },
          sheetAnimStyle,
        ]}
      >
        <View style={styles.dragHandle} />
        <StyledText weight="bold" size={20} style={styles.title}>
          Contact
        </StyledText>

        <View style={styles.searchBar}>
          <SearchIcon size={18} color={theme.textTertiary} />
          <TextInput
            placeholder="Search people..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
        </View>

        {contactsStatus === "denied" ? (
          <View style={styles.centered}>
            <StyledText
              style={{ color: theme.textSecondary, textAlign: "center" }}
            >
              Contacts access was denied. Enable it in Settings to find friends
              on ChatMe.
            </StyledText>
          </View>
        ) : showLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.buttonPrimary} />
          </View>
        ) : isSearching ? (
          queryTooShort ? (
            <View style={styles.centered}>
              <StyledText
                style={{ color: theme.textSecondary, textAlign: "center" }}
              >
                Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search
              </StyledText>
            </View>
          ) : isSearchLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={theme.buttonPrimary} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchRow}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderContactRow}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <StyledText
                  size={13}
                  weight="bold"
                  style={{ color: theme.textTertiary }}
                >
                  {section.title}
                </StyledText>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </Animated.View>
    </View>
  );
};

export default ContactScreen;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(8, 28, 44, 0.5)",
    },
    sheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "88%",
      backgroundColor: theme.bgNeutral,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
    },
    dragHandle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border2,
      marginBottom: 12,
    },
    title: {
      textAlign: "center",
      marginBottom: 16,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
    },
    listContent: {
      paddingBottom: 40,
    },
    sectionHeader: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      backgroundColor: theme.bgPrimaryLighter,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    body: {
      flex: 1,
      gap: 2,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    chevron: {
      transform: [{ rotate: "180deg" }],
    },
    tag: {
      backgroundColor: theme.buttonPrimary,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
    },
  });
