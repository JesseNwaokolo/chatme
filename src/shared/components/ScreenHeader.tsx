import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyledText } from "./StyledText";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

const BACK_BUTTON_SIZE = 24;

export const ScreenHeader = ({ title, onBack }: ScreenHeaderProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 16 }]}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={20}
        style={styles.backButton}
      >
        <ChevronLeftIcon color={theme.buttonPrimaryText} />
      </Pressable>
      <StyledText
        weight="bold"
        size={20}
        numberOfLines={1}
        style={{ color: theme.buttonPrimaryText, flex: 1, textAlign: "center" }}
      >
        {title}
      </StyledText>
      <View style={styles.backButton} />
    </View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    backButton: {
      width: BACK_BUTTON_SIZE,
      height: BACK_BUTTON_SIZE,
    },
  });
};
