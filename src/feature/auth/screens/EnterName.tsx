import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import { TextField } from "@/src/shared/components/TextField";
import { ChevronLeftIcon, PersonIcon } from "@/src/shared/icons";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const EnterName = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [name, setName] = useState(user?.displayName ?? "");

  const onSubmit = () => {
    router.push({
      pathname: "/(auth)/upload-photo",
      params: { displayName: name },
    });
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
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            icon={(color) => <PersonIcon color={color} />}
            placeholder="Name"
          />
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
  });
};
