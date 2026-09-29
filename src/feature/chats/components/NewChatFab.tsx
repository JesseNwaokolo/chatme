import { PlusIcon } from "@/src/shared/icons";
import useThemeStore from "@/src/theme/useThemeStore";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { NewChatMenu } from "./NewChatMenu";
import { NewGroupSheet, NewGroupSheetRef } from "./NewGroupSheet";

export const NewChatFab = () => {
  const { accentColor } = useThemeStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const groupSheetRef = useRef<NewGroupSheetRef>(null);

  const rotation = useSharedValue(0);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    rotation.value = withTiming(next ? 45 : 0, { duration: 200 });
  };

  const closeMenu = () => {
    setMenuOpen(false);
    rotation.value = withTiming(0, { duration: 200 });
  };

  const handleNewChat = () => {
    closeMenu();
    router.push("/contact");
  };

  const handleNewContact = () => {
    closeMenu();
    router.push("/new-contact");
  };

  const handleNewGroup = () => {
    closeMenu();
    groupSheetRef.current?.present();
  };

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <>
      <NewChatMenu
        visible={menuOpen}
        onDismiss={closeMenu}
        onSelectNewChat={handleNewChat}
        onSelectNewContact={handleNewContact}
        onSelectNewGroup={handleNewGroup}
      />
      <NewGroupSheet ref={groupSheetRef} />
      <Pressable style={styles.fab} onPress={toggleMenu}>
        <Animated.View style={iconAnimStyle}>
          <PlusIcon color={accentColor} />
        </Animated.View>
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: "#0c291d",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
