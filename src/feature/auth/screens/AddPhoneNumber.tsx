import { useRequestOtp } from "@/src/feature/auth/api/useRequestOtp";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import PhoneNumber from "../components/PhoneNumber";

const AddPhoneNumber = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const { mutate, isPending } = useRequestOtp();

  const onSubmit = () => {
    mutate(
      { phoneNumber: phone },
      {
        onSuccess: (data) => {
        // 1234 is a hardcoded placeholder until real codes are sent.
          Toast.show({
            type: "success",
            text1: `Code sent to ${data.phoneNumberMasked}`,
            text2: "Your code: 1234",
            visibilityTime: 8000,
          });
          router.push({
            pathname: "/(auth)/verify-otp",
            params: {
              phone,
              challengeId: data.challengeId,
              phoneNumberMasked: data.phoneNumberMasked,
              expiresInSeconds: String(data.expiresInSeconds),
              resendInSeconds: String(data.resendInSeconds),
              codeLength: String(data.codeLength),
            },
          });
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Couldn't send code",
            text2: error.message,
          });
        },
      },
    );
  };

  return (
    <MySafeArea
      style={styles.container}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={24}>
        <View style={styles.view}>
          {/* texts */}
          <View style={{ gap: 12 }}>
            <StyledText weight="bold" size={24} style={styles.title}>
              What&apos;s your phone number?
            </StyledText>
            <StyledText style={styles.text} size={14}>
              We will send you the verification code.
            </StyledText>
          </View>
          {/* phone number input */}
          <View>
            <PhoneNumber phone={phone} setPhone={setPhone} />
          </View>
        </View>
        <Button
          title="Next"
          disabled={!phone || isPending}
          loading={isPending}
          style={{ marginBottom: 6 }}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </MySafeArea>
  );
};

export default AddPhoneNumber;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.bgNeutral,
      gap: 24,
    },
    view: {
      flex: 1,
      paddingTop: 64,
      gap: 24,
    },
    title: {
      lineHeight: getLineHeight(24, 1.25),
    },
    text: {
      color: theme.textSecondary,
      lineHeight: getLineHeight(14),
    },
  });
};
