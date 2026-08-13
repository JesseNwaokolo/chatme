import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import OTP, { OTP_LENGTH } from "../components/OTP";

const RESEND_SECONDS = 24;

interface VerifyOtpProps {
  phone: string;
}

export default function VerifyOtp({ phone }: VerifyOtpProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const [otpValue, setOtpValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onResend = () => {
    console.log("resend otp");
    setSecondsLeft(RESEND_SECONDS);
  };

  const onSubmit = () => {
    console.log(otpValue);
    router.push({
      pathname: "/(auth)/enter-name",
      params: { phone },
    });
  };

  return (
    <MySafeArea style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={24}>
        <View style={styles.view}>
          <Pressable onPress={() => router.back()} style={styles.button}>
            <ChevronLeftIcon />
          </Pressable>
          <View style={{ gap: 12, marginBottom: 8 }}>
            <StyledText weight="bold" size={24} style={styles.title}>
              Verification code
            </StyledText>

            <StyledText style={styles.text}>
              Enter the code number we sent to{" "}
              <StyledText
                weight="medium"
                style={[styles.text, { color: theme.textPrimary }]}
              >
                {phone ? phone : "+62 85-830-544-382."}
              </StyledText>
            </StyledText>
          </View>
          <OTP setOtpValue={setOtpValue} />
          <View style={styles.resendConatiner}>
            <StyledText style={styles.resendText}>
              If you don&apos;t get the code, resend it in{" "}
              <StyledText size={14} style={{ color: theme.textPrimary }}>
                {secondsLeft}
              </StyledText>{" "}
              seconds.
            </StyledText>
            {secondsLeft === 0 && (
              <Pressable hitSlop={20} onPress={onResend}>
                <StyledText style={styles.resendCode}>Resend code</StyledText>
              </Pressable>
            )}
          </View>
        </View>
        <Button
          title="Next"
          style={{ marginBottom: 6 }}
          disabled={otpValue.length < OTP_LENGTH}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </MySafeArea>
  );
}

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.bgNeutral,
      gap: 24,
      paddingTop: 12,
    },
    view: {
      flex: 1,
      gap: 24,
    },
    button: {
      padding: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignSelf: "flex-start",
    },
    title: {
      lineHeight: getLineHeight(24, 1.25),
    },
    text: {
      color: theme.textSecondary,
      lineHeight: getLineHeight(14),
      fontSize: getScaledFontSize(14),
    },
    resendConatiner: {
      gap: 8,
      alignItems: "center",
    },
    resendText: {
      color: theme.textSecondary,
      fontSize: getScaledFontSize(14),
      lineHeight: getLineHeight(14),
    },
    resendCode: {
      color: theme.buttonPrimary,
      fontSize: getScaledFontSize(14),
    },
  });
};
