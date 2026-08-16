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

const PhoneNumber = ({ setPhone }: PhoneNumberProps) => {
  const [nationalNumber, setNationalNumber] = useState("");
  const [country, setCountry] = useState<ICountry | null>(null);
  const { theme } = useTheme();

  const emitFullNumber = (digits: string, selectedCountry: ICountry | null) => {
    const dialCode = selectedCountry?.idd?.root ?? "";
    const nationalDigits = digits.replace(/\D/g, "");
    setPhone(nationalDigits ? `${dialCode}${nationalDigits}` : "");
  };

  const handleChangePhoneNumber = (value: string) => {
    setNationalNumber(value);
    emitFullNumber(value, country);
  };

  const handleChangeCountry = (selectedCountry: ICountry) => {
    setCountry(selectedCountry);
    emitFullNumber(nationalNumber, selectedCountry);
  };

  return (
    <PhoneInput
      value={nationalNumber}
      onChangePhoneNumber={handleChangePhoneNumber}
      country={country}
      onChangeCountry={handleChangeCountry}
      defaultCountry="NG"
      placeholder="Phone number"
      phoneInputStyles={{
        divider: {
          width: 0,
          marginHorizontal: 0,
        },
        caret: {
          width: 0,
          height: 0,
          borderWidth: 0,
          padding: 0,
          overflow: "hidden",
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
