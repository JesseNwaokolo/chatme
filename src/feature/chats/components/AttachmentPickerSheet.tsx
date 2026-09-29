import { StyledText } from "@/src/shared/components/StyledText";
import { CameraIcon, DocumentIcon, GalleryIcon, LocationIcon, PersonIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

interface AttachmentPickerSheetProps {
  onPickImage: (uri: string) => void;
  onPickDocument: () => void;
  onPickContact: () => void;
  onPickLocation: () => void;
}

export const AttachmentPickerSheet = ({
  onPickImage,
  onPickDocument,
  onPickContact,
  onPickLocation,
}: AttachmentPickerSheetProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [recentPhotos, setRecentPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted" || cancelled) {
        setLoadingPhotos(false);
        return;
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        sortBy: "creationTime",
        first: 30,
      });
      if (!cancelled) {
        setRecentPhotos(assets);
        setLoadingPhotos(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow camera access to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) onPickImage(result.assets[0].uri);
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo library access to share photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) onPickImage(result.assets[0].uri);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(150)}
      style={styles.sheet}
    >
      <View style={styles.stripRow}>
        {loadingPhotos ? (
          <ActivityIndicator color={theme.buttonPrimary} />
        ) : (
          <FlatList
            data={recentPhotos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.stripContent}
            ListHeaderComponent={
              <Pressable style={styles.cameraTile} onPress={handleTakePhoto}>
                <CameraIcon size={28} color={theme.bgNeutral} />
              </Pressable>
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => onPickImage(item.uri)}>
                <Image source={{ uri: item.uri }} style={styles.thumb} contentFit="cover" />
              </Pressable>
            )}
          />
        )}
      </View>

      <Pressable style={styles.row} onPress={handleChooseFromLibrary}>
        <GalleryIcon color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Photo or Gallery
        </StyledText>
      </Pressable>

      <Pressable style={styles.row} onPress={onPickDocument}>
        <DocumentIcon color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Document
        </StyledText>
      </Pressable>

      <Pressable style={styles.row} onPress={onPickLocation}>
        <LocationIcon color={theme.buttonPrimary} />
        <StyledText weight="medium" size={16}>
          Location
        </StyledText>
      </Pressable>

      <Pressable style={styles.row} onPress={onPickContact}>
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
