import { StyledText } from "@/src/shared/components/StyledText";
import { CameraIcon, DocumentIcon, GalleryIcon, LocationIcon, PersonIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import { PickedMedia } from "../types";
import { ActivityIndicator, Alert, FlatList, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { describeError } from "@/src/helpers/redact";

type StripState = "loading" | "ready" | "limited" | "denied" | "error";

interface AttachmentPickerSheetProps {
  onPickMedia: (items: PickedMedia[]) => void;
  onPickDocument: () => void;
  onPickContact: () => void;
  onPickLocation: () => void;
}

export const AttachmentPickerSheet = ({
  onPickMedia,
  onPickDocument,
  onPickContact,
  onPickLocation,
}: AttachmentPickerSheetProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [recentPhotos, setRecentPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [strip, setStrip] = useState<StripState>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStrip("loading");

    (async () => {
      try {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (cancelled) return;
        if (permission.status !== "granted") {
          setStrip("denied");
          return;
        }
        const { assets } = await MediaLibrary.getAssetsAsync({
          mediaType: ["photo", "video"],
          sortBy: "creationTime",
          first: 30,
        });
        if (cancelled) return;
        setRecentPhotos(assets);
        setStrip(permission.accessPrivileges === "limited" ? "limited" : "ready");
      } catch (error) {
        console.log("[picker] recent media failed:", describeError(error));
        if (!cancelled) setStrip("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retryStrip = useCallback(() => setAttempt((n) => n + 1), []);

  const toPicked = (asset: ImagePicker.ImagePickerAsset): PickedMedia => ({
    uri: asset.uri,
    kind: asset.type === "video" ? "video" : "image",
    mimeType: asset.mimeType,
    fileName: asset.fileName ?? undefined,
    fileSize: asset.fileSize,
  });

  const alertPermissionDenied = (message: string, canAskAgain: boolean) =>
    Alert.alert(
      "Permission needed",
      message,
      canAskAgain
        ? [{ text: "OK" }]
        : [{ text: "Not now", style: "cancel" }, { text: "Open Settings", onPress: () => Linking.openSettings() }],
    );

  const launch = async (open: () => Promise<ImagePicker.ImagePickerResult>) => {
    try {
      const result = await open();
      if (!result.canceled) onPickMedia(result.assets.map(toPicked));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't open the picker",
        text2: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleTakePhoto = async () => {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alertPermissionDenied("Allow camera access to take a photo.", canAskAgain);
      return;
    }
    await launch(() => ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 }));
  };

  const handleChooseFromLibrary = async () => {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alertPermissionDenied("Allow photo library access to share photos.", canAskAgain);
      return;
    }
    await launch(() =>
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
      }),
    );
  };

  const handleThumbnailPress = async (asset: MediaLibrary.Asset) => {
    let uri = asset.uri;
    if (Platform.OS === "ios") {
      try {
        uri = (await MediaLibrary.getAssetInfoAsync(asset)).localUri ?? asset.uri;
      } catch {
        uri = asset.uri;
      }
    }
    onPickMedia([
      {
        uri,
        kind: asset.mediaType === "video" ? "video" : "image",
        fileName: asset.filename,
      },
    ]);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(150)}
      style={styles.sheet}
    >
      <View style={styles.stripRow}>
        {strip === "loading" ? (
          <ActivityIndicator color={theme.buttonPrimary} accessibilityLabel="Loading recent photos" />
        ) : (
          <FlatList
            data={strip === "ready" || strip === "limited" ? recentPhotos : []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.stripContent}
            ListHeaderComponent={
              <Pressable
                style={styles.cameraTile}
                onPress={handleTakePhoto}
                accessibilityRole="button"
                accessibilityLabel="Take a photo"
              >
                <CameraIcon size={28} color={theme.bgNeutral} />
              </Pressable>
            }
            ListEmptyComponent={
              strip === "denied" || strip === "error" ? (
                <View style={styles.stripMessage}>
                  <StyledText size={13} style={{ color: theme.textSecondary }}>
                    {strip === "denied"
                      ? "Allow photo access to see recent photos."
                      : "Couldn't load recent photos."}
                  </StyledText>
                  <Pressable
                    onPress={strip === "denied" ? () => Linking.openSettings() : retryStrip}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={strip === "denied" ? "Open settings" : "Retry loading recent photos"}
                  >
                    <StyledText size={13} weight="bold" style={{ color: theme.buttonPrimary }}>
                      {strip === "denied" ? "Open Settings" : "Retry"}
                    </StyledText>
                  </Pressable>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleThumbnailPress(item)}
                accessibilityRole="imagebutton"
                accessibilityLabel={item.mediaType === "video" ? "Recent video" : "Recent photo"}
              >
                <Image source={{ uri: item.uri }} style={styles.thumb} contentFit="cover" />
              </Pressable>
            )}
          />
        )}
      </View>
      {strip === "limited" && (
        <Pressable
          onPress={() => Linking.openSettings()}
          accessibilityRole="button"
          accessibilityLabel="Showing selected photos only. Open settings to allow more."
          style={styles.limitedNote}
        >
          <StyledText size={12} style={{ color: theme.textSecondary }}>
            Showing selected photos only · <StyledText size={12} weight="bold" style={{ color: theme.buttonPrimary }}>Manage</StyledText>
          </StyledText>
        </Pressable>
      )}

      <Pressable style={styles.row} onPress={handleChooseFromLibrary} accessibilityRole="button" accessibilityLabel="Photo or Gallery">
        <GalleryIcon color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Photo or Gallery
        </StyledText>
      </Pressable>

      <Pressable style={styles.row} onPress={onPickDocument} accessibilityRole="button" accessibilityLabel="Document">
        <DocumentIcon color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Document
        </StyledText>
      </Pressable>

      <Pressable style={styles.row} onPress={onPickLocation} accessibilityRole="button" accessibilityLabel="Location">
        <LocationIcon color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Location
        </StyledText>
      </Pressable>

      <Pressable style={styles.row} onPress={onPickContact} accessibilityRole="button" accessibilityLabel="Contact">
        <PersonIcon size={20} color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Contact
        </StyledText>
      </Pressable>
    </Animated.View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    sheet: {
      backgroundColor: theme.bgNeutral,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingBottom: 8,
      shadowColor: theme.shadow,
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -4 },
      elevation: 8,
    },
    stripRow: {
      height: 104,
      justifyContent: "center",
      marginBottom: 12,
    },
    stripContent: {
      gap: 8,
      paddingHorizontal: 16,
    },
    cameraTile: {
      width: 104,
      height: 104,
      borderRadius: 12,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.textSecondary,
    },
    stripMessage: {
      height: 104,
      justifyContent: "center",
      gap: 4,
      paddingRight: 16,
    },
    limitedNote: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    thumb: {
      width: 104,
      height: 104,
      borderRadius: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
  });
};
