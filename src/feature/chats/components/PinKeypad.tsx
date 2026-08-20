import { StyledText } from "@/src/shared/components/StyledText";
import { BackspaceIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "backspace"],
];

interface PinKeypadProps {
  onPressDigit: (digit: string) => void;
  onBackspace: () => void;
}

export const PinKeypad = ({ onPressDigit, onBackspace }: PinKeypadProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const scale = useSharedValue(1);

  const pulse = () => {
    scale.value = withSequence(
      withTiming(0.94, { duration: 80 }),
      withTiming(1, { duration: 120 }),
    );
  };

  const handleDigitPress = (digit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pulse();
    onPressDigit(digit);
  };

  const handleBackspacePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pulse();
    onBackspace();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === "") {
              return <View key={keyIndex} style={styles.keySpacer} />;
            }

            if (key === "backspace") {
              return (
                <Pressable
                  key={keyIndex}
                  style={styles.key}
                  onPress={handleBackspacePress}
                >
                  <BackspaceIcon color={theme.textPrimary} />
                </Pressable>
              );
            }

            return (
              <Pressable
                key={keyIndex}
                style={styles.key}
                onPress={() => handleDigitPress(key)}
              >
                <StyledText weight="bold" size={24}>
                  {key}
                </StyledText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      gap: 24,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    key: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    keySpacer: {
      width: 72,
      height: 72,
    },
  });
};
