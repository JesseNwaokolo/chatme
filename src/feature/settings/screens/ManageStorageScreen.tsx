import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContactStorageRow } from "../components/ContactStorageRow";
import { mockStorageContacts } from "../data/mockStorageContacts";

const MEDIA_AND_FILES_GB = 2.1;
const FREE_GB = 62.5;
const USED_PERCENT = (MEDIA_AND_FILES_GB / (MEDIA_AND_FILES_GB + FREE_GB)) * 100;

const ManageStorageScreen = () => {
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
        <StyledText weight="bold" size={20} numberOfLines={1} style={styles.title}>
          Manage Storage
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={mockStorageContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ContactStorageRow contact={item} onPress={() => {}} />}
        ListHeaderComponent={
          <View style={styles.storageSection}>
            <StyledText weight="bold" size={18} style={styles.sectionTitle}>
              Storage
            </StyledText>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${USED_PERCENT}%`, backgroundColor: theme.buttonPrimary },
                ]}
              />
            </View>

            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.buttonPrimary }]} />
              <StyledText size={14} style={styles.legendText}>
                Media and Files • {MEDIA_AND_FILES_GB} GB
              </StyledText>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.neutralActionLight }]} />
              <StyledText size={14} style={styles.legendText}>
                Free • {FREE_GB} GB
              </StyledText>
            </View>

            <Pressable onPress={() => Alert.alert("Clear Cache")}>
              <StyledText weight="medium" style={{ color: theme.buttonPrimary }}>
                Clear Cache
              </StyledText>
            </Pressable>

            <StyledText weight="bold" size={18} style={styles.sectionTitle}>
              Chat
            </StyledText>
          </View>
        }
      />
    </View>
  );
};

export default ManageStorageScreen;

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
      paddingBottom: 24,
    },
    storageSection: {
      gap: 12,
      paddingTop: 24,
      paddingBottom: 8,
    },
    sectionTitle: {
      color: theme.textPrimary,
    },
    progressTrack: {
      width: "100%",
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.neutralActionLight,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 5,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      color: theme.textPrimary,
    },
  });
};
