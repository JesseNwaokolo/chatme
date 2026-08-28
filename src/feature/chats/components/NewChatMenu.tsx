import { getLineHeight } from "@/src/helpers/lineHeight";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChatIcon, NewContactIcon, NewGroupIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface NewChatMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectNewChat: () => void;
}

const PILLS = [
  { key: "newChat", icon: ChatIcon, label: "New Chat" },
  { key: "newContact", icon: NewContactIcon, label: "New Contact" },
  { key: "newGroup", icon: NewGroupIcon, label: "New Group" },
] as const;

export const NewChatMenu = ({
  visible,
  onDismiss,
  onSelectNewChat,
}: NewChatMenuProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, overlayOpacity]);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  const handlePress = (key: (typeof PILLS)[number]["key"]) => {
    if (key === "newChat") {
      onSelectNewChat();
      return;
    }
    onDismiss();
  };

  return (
    <>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss}>
        <Animated.View style={[styles.overlay, overlayAnimStyle]} />
      </Pressable>

      <View style={styles.pillColumn} pointerEvents="box-none">
        {PILLS.map(({ key, icon: Icon, label }) => (
          <Pressable
            key={key}
            style={styles.pill}
            onPress={() => handlePress(key)}
          >
            <Icon size={24} color={theme.buttonPrimary} />
            <StyledText
              weight="bold"
              size={16}
              style={{
                color: theme.textTertiary,
                lineHeight: getLineHeight(18, 1.25),
              }}
            >
              {label}
            </StyledText>
          </Pressable>
        ))}
      </View>
    </>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(8, 28, 44, 0.5)",
    },
    pillColumn: {
      position: "absolute",
      right: 24,
      bottom: 104,
      alignItems: "flex-end",
      gap: 12,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      width: 180,
      gap: 16,
      backgroundColor: theme.bgNeutral,
      borderRadius: 100,
      padding: 16,
      shadowColor: theme.shadow2,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  });
