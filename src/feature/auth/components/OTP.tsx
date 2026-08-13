import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { StyleSheet, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";

export const OTP_LENGTH = 4;

interface OTPProps {
  setOtpValue: (otpValue: string) => void;
}

const OTP = ({ setOtpValue }: OTPProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={{ marginTop: 8 }}>
      <OtpInput
        numberOfDigits={OTP_LENGTH}
        onTextChange={setOtpValue}
        focusColor={theme.buttonPrimary}
        theme={{
          containerStyle: styles.container,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
        }}
      />
    </View>
  );
};

export default OTP;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      gap: 16,
      justifyContent: "flex-start",
    },
    pinCodeContainer: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderColor: theme.border,
      height: 56,
      width: 56,
    },
    pinCodeText: {
      color: theme.textPrimary,
      fontSize: getScaledFontSize(28),
      lineHeight: getLineHeight(28, 1.25),
      fontFamily: fonts.bold,
    },
  });
};
