import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RadioRow } from "../components/RadioRow";

const OPTIONS = ["Off", "Wi-Fi", "Wifi and Cellular"];

const AutoDownloadOptionScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { label, value } = useLocalSearchParams<{ label: string; value: string }>();
  const [selected, setSelected] = useState(value ?? OPTIONS[0]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <ChevronLeftIcon color={theme.buttonPrimaryText} />
        </Pressable>
        <StyledText weight="bold" size={20} numberOfLines={1} style={styles.title}>
          {label}
        </StyledText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {OPTIONS.map((option, index) => (
          <RadioRow
            key={option}
            label={option}
            selected={selected === option}
            showDivider={index < OPTIONS.length - 1}
            onPress={() => setSelected(option)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default AutoDownloadOptionScreen;

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
  });
};
