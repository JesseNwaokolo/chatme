import { StyledText } from "@/src/shared/components/StyledText";
import { ReactNode } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface SwipeActionButtonProps {
  label: string;
  icon: ReactNode;
  backgroundColor: string;
  onPress: () => void;
}

export const SwipeActionButton = ({
  label,
  icon,
  backgroundColor,
  onPress,
}: SwipeActionButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.action, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon}
      <StyledText size={14} weight="medium" style={styles.label}>
        {label}
      </StyledText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  action: {
    width: 72,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 8,
  },
  label: {
    color: "#FFFFFF",
  },
});
