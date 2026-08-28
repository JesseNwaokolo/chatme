import { getLineHeight } from "@/src/helpers/lineHeight";
import { Avatar } from "@/src/shared/components/Avatar";
import { MySafeArea } from "@/src/shared/components/MySafeArea";
import { StyledText } from "@/src/shared/components/StyledText";
import {
  BellIcon,
  ContrastIcon,
  DatabaseIcon,
  EditIcon,
  LockOutlineIcon,
  LogoutIcon,
  PeopleIcon,
  PhoneIcon,
  QrCodeIcon,
  QuestionCircleIcon,
  StarIcon,
} from "@/src/shared/icons";
import { logout } from "@/src/store/logout";
import useUserStore from "@/src/store/useUserStore";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SettingsRow } from "../components/SettingsRow";

const SettingsScreen = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const appVersion = Constants.expoConfig?.version ?? "1.0";
  const currentYear = new Date().getFullYear();

  return (
    <MySafeArea style={styles.container}>
      <View style={styles.header}>
        <StyledText
          weight="bold"
          size={24}
          style={{ lineHeight: getLineHeight(24, 1.25) }}
        >
          Settings
        </StyledText>
        <Pressable onPress={() => router.push("/edit-profile")} hitSlop={20}>
          <EditIcon size={24} color={theme.buttonPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileRow}>
          <Avatar
            name={user?.displayName ?? ""}
            imageUrl={user?.avatarUrl}
            size={64}
          />
          <View style={styles.profileInfo}>
            <StyledText
              weight="bold"
              size={20}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ lineHeight: getLineHeight(20, 1.25) }}
            >
              {user?.displayName}
            </StyledText>
            <StyledText
              style={{ color: theme.textSecondary }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.phoneNumber}
            </StyledText>
          </View>
          <Pressable onPress={() => {}}>
            <QrCodeIcon size={32} color={theme.buttonPrimary} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View>
          <SettingsRow
            icon={<StarIcon color={theme.buttonPrimary} />}
            label="Star messages"
            type="nav"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<PhoneIcon color={theme.buttonPrimary} />}
            label="Last call"
            type="nav"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<PeopleIcon color={theme.buttonPrimary} />}
            label="My folder"
            type="nav"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<ContrastIcon color={theme.buttonPrimary} />}
            label="Appearance"
            type="nav"
            onPress={() => router.push("/appearance")}
          />
          <SettingsRow
            icon={<BellIcon color={theme.buttonPrimary} />}
            label="Notification"
            type="toggle"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
        </View>

        <View style={styles.divider} />

        <View>
          <SettingsRow
            icon={<LockOutlineIcon color={theme.buttonPrimary} />}
            label="Privacy"
            type="nav"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<DatabaseIcon color={theme.buttonPrimary} />}
            label="Data and storage"
            type="nav"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<QuestionCircleIcon color={theme.buttonPrimary} />}
            label="FAQ"
            type="nav"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<LogoutIcon color={theme.danger} />}
            label="Logout"
            type="nav"
            destructive
            // onPress={logout}
          />
        </View>

        <StyledText size={12} style={styles.footer}>
          © {currentYear} RiseChat • Ver {appVersion}
        </StyledText>
      </ScrollView>
    </MySafeArea>
  );
};

export default SettingsScreen;

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.bgNeutral,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 16,
      paddingBottom: 20,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    profileInfo: {
      flex: 1,
      gap: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    footer: {
      color: theme.textSecondary,
      marginVertical: 16,
    },
  });
};
