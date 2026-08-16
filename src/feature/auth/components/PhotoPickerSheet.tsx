import { getLineHeight } from "@/src/helpers/lineHeight";
import { StyledText } from "@/src/shared/components/StyledText";
import { CameraIcon, GalleryIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface PhotoPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (uri: string) => void;
}

type StripItem = { asset: MediaLibrary.Asset };

const PhotoPickerSheet = ({
  visible,
  onClose,
  onSelect,
}: PhotoPickerSheetProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();

  const [recentPhotos, setRecentPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 280 });
      overlayOpacity.value = withTiming(1, { duration: 280 });
      loadRecentPhotos();
    }
  }, [visible, translateY, overlayOpacity]);

  const loadRecentPhotos = async () => {
    setLoadingPhotos(true);
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== "granted") {
      setRecentPhotos([]);
      setLoadingPhotos(false);
      return;
    }

    const { assets } = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      sortBy: "creationTime",
      first: 30,
    });
    setRecentPhotos(assets);
    setLoadingPhotos(false);
  };

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 220 });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 220 },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  };

  const finishSelect = (uri: string) => {
    onSelect(uri);
    handleDismiss();
  };

  const handleThumbnailPress = (asset: MediaLibrary.Asset) => {
    finishSelect(asset.uri);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow camera access to take a profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      finishSelect(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to upload a profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      finishSelect(result.assets[0].uri);
    }
  };

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const stripData: StripItem[] = [...recentPhotos.map((asset) => ({ asset }))];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Pressable style={StyleSheet.absoluteFillObject} onPress={handleDismiss}>
        <Animated.View style={[styles.overlay, overlayAnimStyle]} />
      </Pressable>
      <Animated.View
        style={[styles.sheet, { bottom: insets.bottom + 8 }, sheetAnimStyle]}
      >
        <View style={styles.stripRow}>
          {loadingPhotos ? (
            <ActivityIndicator color={theme.buttonPrimary} />
          ) : (
            <FlatList
              data={stripData}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.asset.id}
              contentContainerStyle={styles.stripContent}
              renderItem={
                ({ item, index }) => (
                  <Pressable onPress={() => handleThumbnailPress(item.asset)}>
                    <Image
                      source={{ uri: item.asset.uri }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                    {/* camera-icon-overlay */}
                    {index === 0 && (
                      <View style={styles.cameraOverlay}>
                        <CameraIcon size={32} color={theme.bgNeutral} />
                      </View>
                    )}
                  </Pressable>
                )
                // )
              }
            />
          )}
        </View>

        <Pressable style={styles.row} onPress={handleTakePhoto}>
          <CameraIcon color={theme.buttonPrimary} />

          <StyledText weight="medium" style={{ lineHeight: getLineHeight(16) }}>
            Take Photo
          </StyledText>
        </Pressable>

        <Pressable style={styles.row} onPress={handleChooseFromLibrary}>
          <GalleryIcon color={theme.buttonPrimary} />
          <StyledText weight="medium" style={{ lineHeight: getLineHeight(16) }}>
            Choose From Library
          </StyledText>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default PhotoPickerSheet;

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
      paddingVertical: 8,
      //to-do add shadow
    },
    stripRow: {
      height: 64,
      justifyContent: "center",
      marginBottom: 8,
    },
    stripContent: {
      gap: 8,
      paddingHorizontal: 8,
    },
    cameraOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginHorizontal: 8,
    },
  });
};
