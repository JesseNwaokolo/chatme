import useNotificationBannerStore, { BannerPayload } from "@/src/store/useNotificationBannerStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "./Avatar";
import { StyledText } from "./StyledText";

const AUTO_DISMISS_MS = 3500;
const ENTER_DURATION_MS = 250;
const EXIT_DURATION_MS = 200;
const HIDDEN_Y = -200;
const SWIPE_UP_THRESHOLD = -20;
const SWIPE_UP_VELOCITY_THRESHOLD = -500;

export const InAppNotificationBanner = () => {
  const banner = useNotificationBannerStore((s) => s.banner);
  if (!banner) return null;
  return <BannerCard key={banner.id} banner={banner} />;
};

const BannerCard = ({ banner }: { banner: BannerPayload }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dismiss = useNotificationBannerStore((s) => s.dismiss);

  const translateY = useSharedValue(HIDDEN_Y);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: ENTER_DURATION_MS });
    opacity.value = withTiming(1, { duration: ENTER_DURATION_MS });

    const timer = setTimeout(() => exit(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  const exit = () => {
    opacity.value = withTiming(0, { duration: EXIT_DURATION_MS });
    translateY.value = withTiming(HIDDEN_Y, { duration: EXIT_DURATION_MS }, (finished) => {
      if (finished) runOnJS(dismiss)();
    });
  };

  const handlePress = () => {
    dismiss();
    router.push({
      pathname: "/conversation/[id]",
      params: {
        id: banner.conversationId,
        participantId: banner.participantId,
        name: banner.name,
        avatarUrl: banner.avatarUrl ?? "",
      },
    });
  };

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handlePress)();
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < SWIPE_UP_THRESHOLD || event.velocityY < SWIPE_UP_VELOCITY_THRESHOLD) {
        runOnJS(exit)();
      } else {
        translateY.value = withTiming(0, { duration: 150 });
      }
    });

  const gesture = Gesture.Race(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Avatar name={banner.name} imageUrl={banner.avatarUrl} isGroup={banner.isGroup} size={40} />
          <View style={styles.body}>
            <StyledText weight="bold" numberOfLines={1} style={styles.name}>
              {banner.name}
            </StyledText>
            <StyledText numberOfLines={1} ellipsizeMode="tail" style={styles.message}>
              {banner.text}
            </StyledText>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingHorizontal: 12,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 16,
      backgroundColor: theme.bgNeutral,
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    body: {
      flex: 1,
      gap: 2,
    },
    name: {
      color: theme.textPrimary,
    },
    message: {
      color: theme.textSecondary,
    },
  });
};
