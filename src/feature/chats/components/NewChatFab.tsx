import { PlusIcon } from "@/src/shared/icons";
import { Pressable, StyleSheet } from "react-native";

export const NewChatFab = () => {
  return (
    <Pressable style={styles.fab}>
      <PlusIcon />
    </Pressable>
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
