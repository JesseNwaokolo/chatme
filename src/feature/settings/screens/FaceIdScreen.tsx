import { Button } from "@/src/shared/components/Button";
import { StyledText } from "@/src/shared/components/StyledText";
import { CheckIcon, ChevronLeftIcon } from "@/src/shared/icons";
import useSecurityStore from "@/src/store/useSecurityStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScanStatus = "scanning" | "success";

const FRAME_WIDTH = 240;
const FRAME_HEIGHT = 300;
const DOT_SIZE = 6;
const FOCUS_DOT_SIZE = 12;

const SCAN_DOTS: { x: number; y: number; size: number }[] = [
  { x: 0.35, y: 0.18, size: DOT_SIZE },
  { x: 0.58, y: 0.16, size: DOT_SIZE },
  { x: 0.22, y: 0.42, size: DOT_SIZE },
  { x: 0.3, y: 0.52, size: FOCUS_DOT_SIZE },
  { x: 0.47, y: 0.46, size: DOT_SIZE },
  { x: 0.68, y: 0.4, size: DOT_SIZE },
  { x: 0.24, y: 0.68, size: DOT_SIZE },
  { x: 0.58, y: 0.72, size: DOT_SIZE },
  { x: 0.44, y: 0.82, size: DOT_SIZE },
];

const SCAN_DURATION_MS = 3000;
const SCAN_STEP_MS = 60;
const SCAN_STEP = Math.ceil((SCAN_STEP_MS / SCAN_DURATION_MS) * 100);

const FaceIdScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ScanStatus>("scanning");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const { status: permissionStatus } = await Camera.requestCameraPermissionsAsync();
      if (permissionStatus !== "granted") {
        Alert.alert("Permission needed", "Allow camera access to set up Face ID.");
        router.back();
        return;
      }
      setHasPermission(true);
    })();
  }, [router]);

  useEffect(() => {
    if (!hasPermission || status !== "scanning") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + SCAN_STEP;
        if (next >= 100) {
          clearInterval(interval);
          setStatus("success");
          return 100;
        }
        return next;
      });
    }, SCAN_STEP_MS);

    return () => clearInterval(interval);
  }, [hasPermission, status]);

  const handleDone = () => {
    useSecurityStore.getState().setFaceIdEnabled(true);
    router.back();
  };

  if (!hasPermission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="front" />

      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={20}>
            <ChevronLeftIcon color="#FFFFFF" />
          </Pressable>
          <StyledText weight="bold" size={20} style={styles.title} numberOfLines={1}>
            Face ID
          </StyledText>
          <View style={styles.headerSpacer} />
        </View>

        <StyledText size={15} style={styles.subtitle}>
          Please put your phone in front of your face
        </StyledText>

        <View style={styles.frameWrapper}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {status === "scanning" ? (
              SCAN_DOTS.map((dot, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dot.size,
                      height: dot.size,
                      borderRadius: dot.size / 2,
                      left: dot.x * FRAME_WIDTH - dot.size / 2,
                      top: dot.y * FRAME_HEIGHT - dot.size / 2,
                    },
                  ]}
                />
              ))
            ) : (
              <View style={styles.successCenter}>
                <View style={styles.successOuter}>
                  <View style={styles.successMid}>
                    <View style={[styles.successInner, { backgroundColor: theme.buttonPrimary }]}>
                      <CheckIcon size={32} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {status === "scanning" ? (
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: theme.buttonPrimary },
                ]}
              />
            </View>
            <StyledText style={styles.progressLabel}>{`${progress}% Complete`}</StyledText>
          </View>
        ) : (
          <Button title="Done" onPress={handleDone} />
        )}
      </View>
    </View>
  );
};

export default FaceIdScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
    },
    overlay: {
      flex: 1,
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      flex: 1,
      textAlign: "center",
      color: "#FFFFFF",
    },
    headerSpacer: {
      width: 24,
      height: 24,
    },
    subtitle: {
      color: "#FFFFFF",
      marginTop: 20,
    },
    frameWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    frame: {
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
    },
    corner: {
      position: "absolute",
      width: 32,
      height: 32,
      borderColor: "#FFFFFF",
    },
    cornerTopLeft: {
      top: 0,
      left: 0,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderTopLeftRadius: 16,
    },
    cornerTopRight: {
      top: 0,
      right: 0,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderTopRightRadius: 16,
    },
    cornerBottomLeft: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderBottomLeftRadius: 16,
    },
    cornerBottomRight: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderBottomRightRadius: 16,
    },
    dot: {
      position: "absolute",
      backgroundColor: "#FFFFFF",
    },
    successCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    successOuter: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    successMid: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    successInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    progressSection: {
      gap: 12,
      alignItems: "center",
    },
    progressTrack: {
      width: "100%",
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.3)",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressLabel: {
      color: "#FFFFFF",
    },
  });
};
