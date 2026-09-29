import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, EditIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CallLogItem } from "../components/CallLogItem";
import { CallLogEntry, mockCallLog } from "../data/mockCallLog";
import { getCallLogDayLabel } from "../utils/callLog";

const LastCallScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = useMemo(() => {
    const groups = new Map<string, CallLogEntry[]>();
    for (const entry of mockCallLog) {
      const label = getCallLogDayLabel(entry.timestamp);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(entry);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, []);

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
          Last Call
        </StyledText>
        <Pressable onPress={() => {}} hitSlop={20}>
          <EditIcon size={24} color={theme.buttonPrimaryText} />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <StyledText size={13} weight="medium" style={styles.sectionHeader}>
            {section.title}
          </StyledText>
        )}
        renderItem={({ item, index, section }) => (
          <CallLogItem
            entry={item}
            showDivider={index < section.data.length - 1}
            onPress={() => {}}
            onInfoPress={() => {}}
          />
        )}
      />
    </View>
  );
};

export default LastCallScreen;

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
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    sectionHeader: {
      color: theme.textSecondary,
      letterSpacing: 0.5,
      paddingTop: 20,
      paddingBottom: 8,
    },
  });
};
