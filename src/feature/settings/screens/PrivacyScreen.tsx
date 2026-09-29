import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrivacyRow } from "../components/PrivacyRow";
import { useBlockedUsers } from "@/src/feature/blocks/api/useBlocks";
import useSecurityStore from "@/src/store/useSecurityStore";

interface PrivacyOption {
  key: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

const PrivacyScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const faceIdEnabled = useSecurityStore((s) => s.faceIdEnabled);
  const { data: blockedUsers } = useBlockedUsers();

  const PRIVACY_OPTIONS: PrivacyOption[] = [
    {
      key: "lastSeen",
      label: "Last Seen",
      value: "Everyone",
      onPress: () => router.push("/last-seen"),
    },
    { key: "profilePhoto", label: "Profile Photo", value: "My Contact" },
    { key: "about", label: "About", value: "My Contact" },
    { key: "group", label: "Group", value: "Everyone" },
    {
      key: "blockedContact",
      label: "Blocked Contact",
      value: `${blockedUsers?.length ?? 0} Contacts`,
      onPress: () => router.push("/blocked-contact"),
    },
    {
      key: "faceId",
      label: "Face ID",
      value: faceIdEnabled ? "On" : "Off",
      onPress: () => router.push("/face-id"),
    },
  ];

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
          Privacy
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {PRIVACY_OPTIONS.map((option, index) => (
          <PrivacyRow
            key={option.key}
            label={option.label}
            value={option.value}
            showDivider={index < PRIVACY_OPTIONS.length - 1}
            onPress={option.onPress ?? (() => {})}
          />
        ))}

        <StyledText size={13} style={styles.caption}>
          With face ID, you can secure your apps
        </StyledText>
      </ScrollView>
    </View>
  );
};

export default PrivacyScreen;

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
    content: {
      paddingHorizontal: 24,
    },
    caption: {
      color: theme.textSecondary,
      marginTop: 12,
    },
  });
};
