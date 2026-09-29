import PhotoPickerSheet from "@/src/feature/auth/components/PhotoPickerSheet";
import PhoneNumber from "@/src/feature/auth/components/PhoneNumber";
import { getLineHeight } from "@/src/helpers/lineHeight";
import { StyledText } from "@/src/shared/components/StyledText";
import { TextField } from "@/src/shared/components/TextField";
import { Button } from "@/src/shared/components/Button";
import {
  CameraPlusIcon,
  ChevronLeftIcon,
  PersonIcon,
  QrCodeIcon,
} from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const AVATAR_SIZE = 148;
const RING_WIDTH = 4;
const BADGE_SIZE = 40;

const NewContactScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const canSave = !!firstName && !!phone;

  const handleSave = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={24}>
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={20}>
              <ChevronLeftIcon color={theme.buttonPrimaryText} />
            </Pressable>
            <StyledText weight="bold" size={18} style={{ color: theme.buttonPrimaryText }}>
              New Contact
            </StyledText>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <PersonIcon size={72} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Pressable style={styles.cameraBadge} onPress={() => setSheetVisible(true)} hitSlop={12}>
            <CameraPlusIcon size={20} color={theme.buttonPrimaryText} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <TextField
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            icon={(color) => <PersonIcon color={color} />}
            placeholder="First Name"
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            icon={(color) => <PersonIcon color={color} />}
            placeholder="Last Name"
          />
          <View style={{ gap: 8 }}>
            <StyledText weight="medium" size={14} style={{ color: theme.textTertiary }}>
              Phone Number
            </StyledText>
            <PhoneNumber phone={phone} setPhone={setPhone} />
          </View>

          <Pressable
            style={styles.qrRow}
            onPress={() => Toast.show({ type: "info", text1: "QR code scanning coming soon" })}
          >
            <QrCodeIcon size={20} color={theme.buttonPrimary} />
            <StyledText weight="medium" size={14} style={{ color: theme.buttonPrimary }}>
              Or add via QR code
            </StyledText>
          </Pressable>
        </View>

        <Button
          title="Save"
          style={[styles.saveButton, { marginBottom: insets.bottom + 8 }]}
          disabled={!canSave}
          onPress={handleSave}
        />
      </KeyboardAvoidingView>

      <PhotoPickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={(uri) => setPhoto(uri)}
      />
    </View>
  );
};

export default NewContactScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgNeutral,
    },
    banner: {
      height: 160,
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerSpacer: {
      width: 24,
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
    avatarImage: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.border,
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
    qrRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 4,
    },
    saveButton: {
      marginTop: "auto",
      marginHorizontal: 24,
    },
  });
};
