import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { StyledText } from "@/src/shared/components/StyledText";
import ChatMeIcon from "@/src/shared/icons/chatmeIcon";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = makeStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding.png")}
        style={{ flex: 1, marginTop: 32 }}
      >
        <View style={styles.iconContainer}>
          <ChatMeIcon />
          <StyledText weight="bold" size={24} style={styles.iconText}>
            ChatMe
          </StyledText>
        </View>
      </ImageBackground>
      <View style={styles.contentContainer}>
        <StyledText weight="bold" size={24} style={styles.title}>
          Stay connected with your friends and family
        </StyledText>

        <StyledText size={14} weight="regular" style={styles.text}>
          ChatMe is messaging app that will help you to connect with everyone.
        </StyledText>

        <Button
          title="Get Started"
          style={styles.button}
          onPress={() => router.push("/(auth)")}
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgPrimaryLight,
    },
    iconContainer: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    iconText: {
      color: theme.buttonPrimary,
    },
    contentContainer: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 6,
      backgroundColor: theme.bgNeutral,
      gap: 12,
    },
    title: {
      width: 304,
      textAlign: "center",
      lineHeight: getLineHeight(24, 1.25),
    },
    text: {
      width: 327,
      textAlign: "center",
      lineHeight: getLineHeight(14),
      color: theme.textSecondary,
    },
    button: {
      width: "100%",
      marginTop: 12,
      marginBottom: 6,
    },
  });
};
