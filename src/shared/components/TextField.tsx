import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { ReactNode, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { StyledText } from "./StyledText";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  icon: (color: string) => ReactNode;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
}

export const TextField = ({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  editable = true,
  keyboardType,
}: TextFieldProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: 8 }}>
      <StyledText weight="medium" size={14}>
        {label}
      </StyledText>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {icon(isFocused ? theme.buttonPrimary : theme.textSecondary)}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          editable={editable}
          keyboardType={keyboardType}
          style={styles.input}
        />
      </View>
    </View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 20,
    },
    inputContainerFocused: {
      borderColor: theme.buttonPrimary,
      backgroundColor: theme.bgPrimaryLight,
    },
    input: {
      flex: 1,
      padding: 0,
      color: theme.textPrimary,
      fontSize: getScaledFontSize(14),
      lineHeight: getLineHeight(14),
      fontFamily: fonts.medium,
    },
  });
};
