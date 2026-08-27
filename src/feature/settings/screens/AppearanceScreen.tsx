import { ScreenHeader } from "@/src/shared/components/ScreenHeader";
import { StyledText } from "@/src/shared/components/StyledText";
import { EmojiIcon, MoonIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { AppIconSwatch } from "../components/AppIconSwatch";
import { SettingsRow } from "../components/SettingsRow";
import { ThemeSwatch } from "../components/ThemeSwatch";
import { THEME_COLOR_OPTIONS } from "../constants/themeOptions";

const AppearanceScreen = () => {
  const { theme, mode, setMode, accentColor, setAccentColor } = useTheme();
  const styles = makeStyles(theme);
  const [largeEmoji, setLargeEmoji] = useState(false);
  const [appIcon, setAppIcon] = useState("Green");

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => {
        setStatusBarStyle(mode === "dark" ? "light" : "dark");
      };
    }, [mode]),
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Appearance" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("@/assets/images/appearance-bg.png")}
          style={styles.preview}
          resizeMode="cover"
        >
          <View style={styles.previewRow}>
            <View style={styles.incomingBubble}>
              <StyledText size={14}>
                Habitant elit pellentesque curabitur morbi sit fusce elit
              </StyledText>
            </View>
            <StyledText size={12} style={{ color: theme.textSecondary }}>
              18:25
            </StyledText>
          </View>

          <View style={[styles.previewRow, styles.previewRowReverse]}>
            <StyledText size={12} style={{ color: theme.textSecondary }}>
              19:40
            </StyledText>
            <View style={[styles.outgoingBubble, { backgroundColor: theme.buttonPrimary }]}>
              <StyledText size={14} style={{ color: theme.buttonPrimaryText }}>
                Gravida lectus semper orci
              </StyledText>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          <StyledText weight="bold" size={18}>
            Select a Theme
          </StyledText>
          <View style={styles.swatchRow}>
            {THEME_COLOR_OPTIONS.map((option) => (
              <ThemeSwatch
                key={option.name}
                name={option.name}
                color={option.color}
                lightColor={option.lightColor}
                selected={option.color === accentColor}
                onPress={() => setAccentColor(option.color)}
              />
            ))}
          </View>

          <View style={styles.toggleGroup}>
            <SettingsRow
              icon={<MoonIcon color={theme.buttonPrimary} />}
              label="Night Mode"
              type="toggle"
              value={mode === "dark"}
              onToggle={(value) => setMode(value ? "dark" : "light")}
            />
            <SettingsRow
              icon={<EmojiIcon color={theme.buttonPrimary} />}
              label="Large Emoji"
              type="toggle"
              value={largeEmoji}
              onToggle={setLargeEmoji}
            />
          </View>

          <StyledText weight="bold" size={18}>
            App Icon
          </StyledText>
          <View style={styles.swatchRow}>
            {THEME_COLOR_OPTIONS.map((option) => (
              <AppIconSwatch
                key={option.name}
                name={option.name}
                color={option.color}
                lightColor={option.lightColor}
                selected={option.name === appIcon}
                onPress={() => setAppIcon(option.name)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AppearanceScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    preview: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      gap: 20,
    },
    previewRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    previewRowReverse: {
      justifyContent: "flex-end",
    },
    incomingBubble: {
      flexShrink: 1,
      maxWidth: "72%",
      backgroundColor: theme.bgNeutral,
      borderRadius: 16,
      padding: 16,
    },
    outgoingBubble: {
      flexShrink: 1,
      maxWidth: "72%",
      borderRadius: 16,
      padding: 16,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
      gap: 16,
    },
    swatchRow: {
      flexDirection: "row",
      gap: 12,
    },
    toggleGroup: {
      marginVertical: 8,
    },
  });
};
