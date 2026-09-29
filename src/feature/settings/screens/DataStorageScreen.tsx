import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrivacyRow } from "../components/PrivacyRow";

interface AutoDownloadOption {
  key: string;
  label: string;
  value: string;
}

const AUTO_DOWNLOAD_OPTIONS: AutoDownloadOption[] = [
  { key: "photos", label: "Photos", value: "Off" },
  { key: "audio", label: "Audio", value: "Wi-Fi" },
  { key: "documents", label: "Documents", value: "Wi-Fi and Cellular" },
  { key: "videos", label: "Videos", value: "Off" },
];

const DataStorageScreen = () => {
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
          Data and Storage
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <PrivacyRow label="Manage Storage" onPress={() => router.push("/manage-storage")} />

        <StyledText size={13} weight="medium" style={styles.sectionHeader}>
          AUTO DOWNLOAD
        </StyledText>
        {AUTO_DOWNLOAD_OPTIONS.map((option) => (
          <PrivacyRow
            key={option.key}
            label={option.label}
            value={option.value}
            onPress={() =>
              router.push({
                pathname: "/auto-download-option",
                params: { label: option.label, value: option.value },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default DataStorageScreen;

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
    sectionHeader: {
      color: theme.textSecondary,
      letterSpacing: 0.5,
      paddingTop: 24,
      paddingBottom: 4,
    },
  });
};
