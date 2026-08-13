import { getScaledFontSize } from "@/src/helpers/fontScale";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon, PersonIcon } from "@/src/shared/icons";
import { fonts } from "@/src/theme/fonts";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const EnterName = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const onSubmit = () => {
    console.log(name);
  };

  return (
    <MySafeArea style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={24}
      >
        <View style={styles.view}>
          <Pressable onPress={() => router.back()} style={styles.button}>
            <ChevronLeftIcon />
          </Pressable>
          <View style={{ gap: 12, marginBottom: 8 }}>
            <StyledText weight="bold" size={24} style={styles.title}>
              Whats your name?
            </StyledText>
            <StyledText style={styles.text} size={14}>
              Write your name. You can change it back in settings.
            </StyledText>
          </View>
          <View style={{ gap: 8 }}>
            <StyledText weight="medium" size={14}>
              Name
            </StyledText>
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
              ]}
            >
              <PersonIcon color={isFocused ? theme.buttonPrimary : theme.textSecondary} />
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Name"
                placeholderTextColor={theme.textSecondary}
                style={styles.input}
              />
            </View>
          </View>
        </View>
        <Button
          title="Next"
          disabled={!name}
          style={{ marginBottom: 6 }}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </MySafeArea>
  );
};

export default EnterName;

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
    },
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
