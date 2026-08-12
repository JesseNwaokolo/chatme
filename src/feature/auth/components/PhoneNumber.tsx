import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { useState } from "react";
import PhoneInput, { ICountry } from "rn-international-phone-number";

interface PhoneNumberProps {
  phone: string;
  setPhone: (phone: string) => void;
}

const PhoneNumber = ({ phone, setPhone }: PhoneNumberProps) => {
  const [country, setCountry] = useState<ICountry | null>(null);
  const { theme } = useTheme();
  return (
    <PhoneInput
      value={phone}
      onChangePhoneNumber={setPhone}
      country={country}
      onChangeCountry={setCountry}
      defaultCountry="NG"
      placeholder="Phone number"
      phoneInputStyles={{
        divider: {
          display: "none",
        },
        caret: {
          display: "none",
        },
        flagContainer: {
          backgroundColor: "transparent",
          marginRight: 16,
          paddingVertical: 18,
          paddingLeft: 20,
        },
        input: {
          paddingLeft: 0,
          color: theme.textPrimary,
          fontSize: getScaledFontSize(14),
          lineHeight: getLineHeight(14),
          fontFamily: fonts.medium,
        },
        container: {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 16,
        },
      }}
    />
  );
};

export default PhoneNumber;
