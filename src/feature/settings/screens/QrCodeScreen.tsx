import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import { CameraIcon, ChevronLeftIcon } from "@/src/shared/icons";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AVATAR_SIZE = 96;
const RING_WIDTH = 4;
const QR_SIZE = 220;

const CARD_TEXT_PRIMARY = "#081C2C";
const CARD_TEXT_SECONDARY = "#6E8597";

const QrCodeScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUserStore((s) => s.user);

  const qrValue = user ? `risechat://contact/${user.id}` : "";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <ChevronLeftIcon color={theme.buttonPrimaryText} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            <Avatar
              name={user?.displayName ?? ""}
              imageUrl={user?.avatarUrl}
              size={AVATAR_SIZE}
            />
          </View>
        </View>

        <View style={styles.card}>
          <StyledText
            weight="bold"
            size={20}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: CARD_TEXT_PRIMARY }}
          >
            {user?.displayName}
          </StyledText>
          <StyledText size={14} style={{ color: CARD_TEXT_SECONDARY }}>
            {user?.phoneNumber}
          </StyledText>

          <View style={styles.qrWrapper}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={QR_SIZE}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            ) : null}
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.scanButton, { marginBottom: insets.bottom + 24 }]}
        onPress={() => {}}
        hitSlop={8}
      >
        <CameraIcon size={20} color={theme.buttonPrimaryText} />
        <StyledText weight="medium" size={16} style={{ color: theme.buttonPrimaryText }}>
          Scan QR code
        </StyledText>
      </Pressable>
    </View>
  );
};

export default QrCodeScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.buttonPrimary,
    },
    header: {
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarWrapper: {
      zIndex: 1,
      marginBottom: -(AVATAR_SIZE / 2) - RING_WIDTH,
    },
    avatarRing: {
      borderWidth: RING_WIDTH,
      borderColor: "#FFFFFF",
      borderRadius: (AVATAR_SIZE + RING_WIDTH * 2) / 2,
      backgroundColor: "#FFFFFF",
    },
    card: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      paddingTop: AVATAR_SIZE / 2 + RING_WIDTH + 24,
      paddingBottom: 32,
      paddingHorizontal: 24,
      gap: 4,
    },
    qrWrapper: {
      marginTop: 24,
    },
    scanButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  });
};
