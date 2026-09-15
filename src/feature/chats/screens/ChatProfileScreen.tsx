import { SettingsRow } from "@/src/feature/settings/components/SettingsRow";
import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import {
  BellIcon,
  BlockIcon,
  ChatIcon,
  ChevronLeftIcon,
  GalleryIcon,
  LinkIcon,
  QrCodeIcon,
  SearchIcon,
  StarIcon,
} from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConversation } from "../api/useConversation";

const HERO_HEIGHT = 420;
const FAB_SIZE = 56;

// Mock placeholders: only name and avatar come from the API right now.
const MOCK_LAST_SEEN = "Last seen 24 minutes ago";
const MOCK_PHONE_NUMBER = "+1 234 567 8900";
const MOCK_DESCRIPTION = "Available";
const MOCK_PHOTO_COUNT = 24;
const MOCK_STAR_COUNT = 6;
const MOCK_SHARED_LINKS_COUNT = 3;
const MOCK_PHOTO_PLACEHOLDERS = [1, 2, 3, 4, 5];

const ChatProfileScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useConversation(id);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (data?.settings) setNotificationsEnabled(!data.settings.muted);
  }, [data?.settings]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  const name = data?.otherParticipant.displayName ?? "Unknown";
  const avatarUrl = data?.otherParticipant.avatarUrl;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.hero}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Avatar name={name} size={160} />
          </View>
        )}
        <View style={styles.heroOverlay} />

        <View style={[styles.heroTopRow, { paddingTop: insets.top + 12 }]}>
          <Pressable style={styles.heroButton} onPress={() => router.back()} hitSlop={12}>
            <ChevronLeftIcon size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.heroTopRowRight}>
            <Pressable style={styles.heroButton} hitSlop={12}>
              <SearchIcon size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.heroButton} hitSlop={12}>
              <QrCodeIcon size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroBottom}>
          <StyledText weight="bold" size={26} style={{ color: "#FFFFFF" }} numberOfLines={1}>
            {name}
          </StyledText>
          <StyledText size={14} style={{ color: "rgba(255,255,255,0.8)" }}>
            {MOCK_LAST_SEEN}
          </StyledText>
        </View>

        <Pressable
          style={[styles.fab, { backgroundColor: theme.buttonPrimary }]}
          onPress={() => router.back()}
        >
          <ChatIcon size={24} color={theme.buttonPrimaryText} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.field}>
          <StyledText weight="bold" size={20}>
            {MOCK_PHONE_NUMBER}
          </StyledText>
          <StyledText size={13} style={{ color: theme.textSecondary }}>
            Phone number
          </StyledText>
        </View>

        <View style={styles.field}>
          <StyledText weight="bold" size={20}>
            {MOCK_DESCRIPTION}
          </StyledText>
          <StyledText size={13} style={{ color: theme.textSecondary }}>
            Description
          </StyledText>
        </View>

        <View style={styles.divider} />

        <StyledText weight="bold" size={18} style={styles.sectionTitle}>
          About
        </StyledText>

        <SettingsRow
          icon={<GalleryIcon color={theme.buttonPrimary} />}
          label={`${MOCK_PHOTO_COUNT} photos`}
          type="nav"
          onPress={() => {}}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoStrip}
          contentContainerStyle={styles.photoStripContent}
        >
          {MOCK_PHOTO_PLACEHOLDERS.map((key) => (
            <View key={key} style={styles.photoPlaceholder} />
          ))}
        </ScrollView>

        <SettingsRow
          icon={<StarIcon color={theme.buttonPrimary} />}
          label={`${MOCK_STAR_COUNT} star message`}
          type="nav"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<LinkIcon color={theme.buttonPrimary} />}
          label={`${MOCK_SHARED_LINKS_COUNT} shared links`}
          type="nav"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<BellIcon color={theme.buttonPrimary} />}
          label="Notifications"
          type="toggle"
          value={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />

        <View style={styles.divider} />

        <Pressable style={styles.blockRow} onPress={() => {}}>
          <BlockIcon size={20} color={theme.danger} />
          <StyledText weight="medium" size={16} style={{ color: theme.danger }}>
            Block contact
          </StyledText>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default ChatProfileScreen;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    hero: {
      height: HERO_HEIGHT,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroFallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.bgPrimaryLight,
    },
    heroOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: HERO_HEIGHT * 0.5,
      backgroundColor: "rgba(8, 28, 44, 0.45)",
    },
    heroTopRow: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    heroTopRowRight: {
      flexDirection: "row",
      gap: 12,
    },
    heroButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(8, 28, 44, 0.5)",
    },
    heroBottom: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 2,
    },
    fab: {
      position: "absolute",
      right: 24,
      bottom: -FAB_SIZE / 2,
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: FAB_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingTop: FAB_SIZE / 2 + 16,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    field: {
      gap: 4,
      marginBottom: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    sectionTitle: {
      marginBottom: 8,
    },
    photoStrip: {
      marginBottom: 8,
    },
    photoStripContent: {
      gap: 8,
      paddingVertical: 4,
    },
    photoPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: theme.bgPrimaryLighter,
    },
    blockRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
  });
