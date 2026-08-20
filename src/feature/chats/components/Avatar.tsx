import { PersonIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { StyleSheet, View, ViewStyle } from "react-native";
import { StyledText } from "@/src/shared/components/StyledText";

const PALETTE = ["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#10B981", "#EC4899"];
const GROUP_BG = "#081C2C";

const colorForName = (name: string) => {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
};

const initialsForName = (name: string) => {
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return initials.toUpperCase();
};

interface AvatarProps {
  name: string;
  size?: number;
  isGroup?: boolean;
  online?: boolean;
  style?: ViewStyle;
}

export const Avatar = ({
  name,
  size = 48,
  isGroup = false,
  online = false,
  style,
}: AvatarProps) => {
  const { theme } = useTheme();

  return (
    <View style={[{ width: size, height: size }, style]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isGroup ? GROUP_BG : colorForName(name),
          },
        ]}
      >
        {isGroup ? (
          <PersonIcon size={size * 0.5} color="#FFFFFF" />
        ) : (
          <StyledText
            weight="bold"
            size={size * 0.36}
            style={{ color: "#FFFFFF" }}
          >
            {initialsForName(name)}
          </StyledText>
        )}
      </View>
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              borderColor: theme.bgNeutral,
              backgroundColor: theme.buttonPrimary,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});
