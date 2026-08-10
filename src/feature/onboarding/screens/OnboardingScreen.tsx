import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding.png")}
        style={{ flex: 1 }}
        resizeMode="contain"
      ></ImageBackground>
      <View style={styles.contentContainer}>
      
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
    contentContainer: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 6,
      backgroundColor: theme.bgNeutral,
    },
  });
};
