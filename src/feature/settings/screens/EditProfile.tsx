import { useSetProfileAvatar } from "@/src/feature/auth/api/useSetProfileAvatar";
import { useUpdateProfile } from "@/src/feature/auth/api/useUpdateProfile";
import PhotoPickerSheet from "@/src/feature/auth/components/PhotoPickerSheet";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { Avatar } from "@/src/shared/components/Avatar";
import { Button } from "@/src/shared/components/Button";
import { StyledText } from "@/src/shared/components/StyledText";
import { TextField } from "@/src/shared/components/TextField";
import {
  CameraPlusIcon,
  ChevronLeftIcon,
  PersonIcon,
  PhoneIcon,
} from "@/src/shared/icons";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getCountryByPhoneNumber } from "rn-international-phone-number";

const AVATAR_SIZE = 148;

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

  const { mutateAsync: updateProfile, isPending: isSavingName } = useUpdateProfile();
  const { mutateAsync: setAvatar, isPending: isSavingAvatar } = useSetProfileAvatar();
  const isPending = isSavingName || isSavingAvatar;

  const country = useMemo(
    () =>
      user?.phoneNumber ? getCountryByPhoneNumber(user.phoneNumber) : undefined,
    [user?.phoneNumber],
  );

  const onSubmit = async () => {
    if (!name || !photo) return;
    try {
      let savedUser = await updateProfile({ displayName: name });
      if (photoChanged) {
        savedUser = await setAvatar(photo);
      }
      setUser(savedUser);
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't save profile",
        text2: error instanceof Error ? error.message : undefined,
      });
    }
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
            <Avatar
              name={user?.displayName ?? ""}
              imageUrl={photo}
              size={AVATAR_SIZE}
            />
          </View>
          <Pressable
            style={styles.cameraBadge}
            onPress={() => setSheetVisible(true)}
            hitSlop={12}
          >
            <CameraPlusIcon size={20} color={theme.buttonPrimaryText} />
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
            icon={(color) =>
              country?.flag ? (
                <StyledText
                  size={20}
                  style={{ lineHeight: getLineHeight(20, 1) }}
                >
                  {country.flag}
                </StyledText>
              ) : (
                <PhoneIcon color={color} />
              )
            }
          />
        </View>

        <Button
          title="Save"
          style={[styles.saveButton, { marginBottom: insets.bottom + 8 }]}
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

const RING_WIDTH = 4;
const BADGE_SIZE = 40;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    banner: {
      height: 160,
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 24,
    },
    avatarWrapper: {
      alignSelf: "center",
      marginTop: -(AVATAR_SIZE / 2) - RING_WIDTH,
      marginBottom: 32,
    },
    avatarRing: {
      borderWidth: RING_WIDTH,
      borderColor: theme.bgNeutral,
      borderRadius: (AVATAR_SIZE + RING_WIDTH * 2) / 2,
      backgroundColor: theme.bgNeutral,
    },
    cameraBadge: {
      position: "absolute",
      right: 0,
      bottom: 4,
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: BADGE_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
    },
    form: {
      paddingHorizontal: 24,
      gap: 24,
    },
    saveButton: {
      marginTop: "auto",
      marginHorizontal: 24,
    },
  });
};
