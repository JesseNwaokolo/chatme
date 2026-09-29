import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RadioRow } from "../components/RadioRow";

type LastSeenOption = "everyone" | "contacts" | "nobody";

const OPTIONS: { key: LastSeenOption; label: string }[] = [
  { key: "everyone", label: "Everyone" },
  { key: "contacts", label: "My Contact" },
  { key: "nobody", label: "Nobody" },
];

const LastSeenScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<LastSeenOption>("everyone");

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
          Last Seen
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {OPTIONS.map((option, index) => (
          <RadioRow
            key={option.key}
            label={option.label}
            selected={selected === option.key}
            showDivider={index < OPTIONS.length - 1}
            onPress={() => setSelected(option.key)}
          />
        ))}

        <StyledText size={13} style={styles.caption}>
          Users who have your number saved in their contacts will also see it.
        </StyledText>
      </ScrollView>
    </View>
  );
};

export default LastSeenScreen;

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
