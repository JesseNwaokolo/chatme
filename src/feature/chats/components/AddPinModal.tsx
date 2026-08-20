import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { StyledText } from "@/src/shared/components/StyledText";
import { LockIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useEffect } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface AddPinModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AddPinModal = ({ visible, onClose, onConfirm }: AddPinModalProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 280 });
      overlayOpacity.value = withTiming(1, { duration: 280 });
    }
  }, [visible, translateY, overlayOpacity]);

  const handleDismiss = (onFinished?: () => void) => {
    overlayOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 220 },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
          if (onFinished) {
            runOnJS(onFinished)();
          }
        }
      },
    );
  };

  const handleConfirm = () => {
    handleDismiss(onConfirm);
  };

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => handleDismiss()}
    >
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={() => handleDismiss()}
      >
        <Animated.View style={[styles.overlay, overlayAnimStyle]} />
      </Pressable>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Animated.View style={[styles.sheet, sheetAnimStyle]}>
          <View style={styles.badge}>
            <LockIcon color={theme.buttonPrimary} />
          </View>

          <StyledText weight="bold" size={20} style={styles.title}>
            Do you want to add a pin code?
          </StyledText>
          <StyledText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Add a verification code to make it more secure.
          </StyledText>

          <View style={{ gap: 8 }}>
            <Button title="Yes" onPress={handleConfirm} />
            <Button
              title="No, thanks"
              variant="secondary"
              onPress={() => handleDismiss()}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AddPinModal;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(8, 28, 44, 0.5)",
    },
    sheet: {
      position: "absolute",
      left: 24,
      right: 24,
      backgroundColor: theme.bgNeutral,
      borderRadius: 16,
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    badge: {
      alignSelf: "center",
      width: 64,
      height: 64,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.bgNeutral,
      transform: [{ translateY: -32 }],
      elevation: 4,
      shadowColor: theme.shadow2,
      shadowOpacity: 0.04,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 4 },
    },
    title: {
      textAlign: "center",
      marginBottom: 8,
      lineHeight: getLineHeight(20),
    },
    subtitle: {
      textAlign: "center",
      lineHeight: getLineHeight(14),
      marginBottom: 27,
    },
  });
};
