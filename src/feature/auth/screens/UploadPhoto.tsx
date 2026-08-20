import { getLineHeight } from "@/src/helpers/lineHeight";
import { Button } from "@/src/shared/components/Button";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import PhotoPickerSheet from "../components/PhotoPickerSheet";

const UploadPhoto = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const onSubmit = () => {
    console.log(photo);
    router.push("/(app)/chats");
  };

  return (
    <MySafeArea style={styles.container}>
      <View style={styles.view}>
        <Pressable onPress={() => router.back()} style={styles.button}>
          <ChevronLeftIcon />
        </Pressable>
        <StyledText weight="bold" size={24} style={styles.title}>
          Upload a photo
        </StyledText>
        <View style={styles.imageWrapper}>
          <Pressable onPress={() => setSheetVisible(true)}>
            <Image
              source={
                photo
                  ? { uri: photo }
                  : require("@/assets/images/upload-photo.png")
              }
              style={photo ? styles.photo : styles.placeholder}
              contentFit="cover"
            />
          </Pressable>
        </View>
      </View>
      <Button
        title={photo ? "Next" : "Upload Photo"}
        style={{ marginBottom: 6 }}
        onPress={photo ? onSubmit : () => setSheetVisible(true)}
      />
      <PhotoPickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={setPhoto}
      />
    </MySafeArea>
  );
};

export default UploadPhoto;

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
      textAlign: "center",
      lineHeight: getLineHeight(24, 1.25),
    },
    imageWrapper: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    placeholder: {
      width: 164,
      height: 164,
    },
    photo: {
      width: 164,
      height: 164,
      borderRadius: 82,
    },
  });
};
