import { useUpdateProfile } from "@/src/feature/auth/api/useUpdateProfile";
import PhotoPickerSheet from "@/src/feature/auth/components/PhotoPickerSheet";
import { uploadAvatar } from "@/src/feature/auth/utils/uploadAvatar";
import { Avatar } from "@/src/shared/components/Avatar";
import { Button } from "@/src/shared/components/Button";
import { TextField } from "@/src/shared/components/TextField";
import { CameraIcon, ChevronLeftIcon, PersonIcon, PhoneIcon } from "@/src/shared/icons";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const AVATAR_SIZE = 140;

const EditProfile = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [name, setName] = useState(user?.displayName ?? "");
  const [photo, setPhoto] = useState<string | null>(user?.avatarUrl ?? null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const onSubmit = async () => {
    if (!name || !photo) return;
    let avatarUrl = photo;
    if (photoChanged) {
      try {
        avatarUrl = await uploadAvatar(photo);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Couldn't upload photo",
          text2: error instanceof Error ? error.message : undefined,
        });
        return;
      }
    }
    updateProfile(
      { displayName: name, avatarUrl },
      {
        onSuccess: (updatedUser) => {
          setUser(updatedUser);
          router.back();
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Couldn't save profile",
            text2: error.message,
          });
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={24}
      >
        <View style={[styles.banner, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => router.back()} hitSlop={20}>
            <ChevronLeftIcon color={theme.buttonPrimaryText} />
          </Pressable>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            <Avatar name={user?.displayName ?? ""} imageUrl={photo} size={AVATAR_SIZE} />
          </View>
          <Pressable
            style={styles.cameraBadge}
            onPress={() => setSheetVisible(true)}
            hitSlop={12}
          >
            <CameraIcon size={20} color={theme.buttonPrimaryText} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            icon={(color) => <PersonIcon color={color} />}
            placeholder="Name"
          />
          <TextField
            label="Phone Number"
            value={user?.phoneNumber ?? ""}
            editable={false}
            icon={(color) => <PhoneIcon color={color} />}
          />
        </View>

        <Button
          title="Save"
          style={styles.saveButton}
          disabled={!name || !photo || isPending}
          loading={isPending}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>

      <PhotoPickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={(uri) => {
          setPhoto(uri);
          setPhotoChanged(true);
        }}
      />
    </View>
  );
};

export default EditProfile;

const RING_WIDTH = 6;
const BADGE_SIZE = 40;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    banner: {
      height: 220,
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 24,
    },
    avatarWrapper: {
      alignSelf: "center",
      marginTop: -(AVATAR_SIZE / 2) - RING_WIDTH,
      marginBottom: 24,
    },
    avatarRing: {
      borderWidth: RING_WIDTH,
      borderColor: theme.bgNeutral,
      borderRadius: (AVATAR_SIZE + RING_WIDTH * 2) / 2,
      backgroundColor: theme.bgNeutral,
    },
    cameraBadge: {
      position: "absolute",
      right: 4,
      bottom: 4,
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: BADGE_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
      borderWidth: 3,
      borderColor: theme.bgNeutral,
    },
    form: {
      paddingHorizontal: 24,
      gap: 24,
    },
    saveButton: {
      marginTop: "auto",
      marginHorizontal: 24,
      marginBottom: 16,
    },
  });
};
