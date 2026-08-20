import { getLineHeight } from "@/src/helpers/lineHeight";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { PinDots } from "../components/PinDots";
import { PinKeypad } from "../components/PinKeypad";

const PIN_LENGTH = 4;

const SetupPinCode = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const [pin, setPin] = useState("");
  const isNavigatingRef = useRef(false);

  const handlePressDigit = (digit: string) => {
    if (isNavigatingRef.current || pin.length >= PIN_LENGTH) {
      return;
    }

    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === PIN_LENGTH) {
      isNavigatingRef.current = true;
      setTimeout(() => {
        router.back();
      }, 200);
    }
  };

  const handleBackspace = () => {
    if (isNavigatingRef.current) {
      return;
    }
    setPin((current) => current.slice(0, -1));
  };

  return (
    <MySafeArea style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeftIcon />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.content}>
          <StyledText weight="bold" size={24} style={styles.title}>
            Setup pin code
          </StyledText>
          <StyledText
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Make sure the code is safe and no one else knows.
          </StyledText>

          <View style={styles.dotsWrapper}>
            <PinDots length={pin.length} />
          </View>
        </View>

        <View style={styles.keypadWrapper}>
          <PinKeypad
            onPressDigit={handlePressDigit}
            onBackspace={handleBackspace}
          />
        </View>
      </View>
    </MySafeArea>
  );
};

export default SetupPinCode;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.bgNeutral,
      paddingTop: 12,
    },
    backButton: {
      padding: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignSelf: "flex-start",
    },
    body: {
      flex: 1,
      justifyContent: "space-between",
    },
    content: {
      alignItems: "center",
      marginTop: 80,
    },
    title: {
      textAlign: "center",
      lineHeight: getLineHeight(24, 1.25),
      marginBottom : 12
    },
    subtitle: {
      textAlign: "center",
      lineHeight: getLineHeight(14),
      maxWidth: 240,
    },
    dotsWrapper: {
      marginTop: 32,
    },
    keypadWrapper: {
      marginBottom: 8,
    },
  });
};
