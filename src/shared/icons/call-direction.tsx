import Svg, { Path } from "react-native-svg";
import { View } from "react-native";

interface CallDirectionIconProps {
  size?: number;
  color?: string;
  direction?: "incoming" | "outgoing";
}

const CallDirectionIcon = ({
  size = 14,
  color = "#6E8597",
  direction = "incoming",
}: CallDirectionIconProps) => {
  return (
    <View
      style={
        direction === "outgoing" ? { transform: [{ rotate: "180deg" }] } : undefined
      }
    >
      <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <Path
          d="M10.5 3.5L3.5 10.5M3.5 10.5H8M3.5 10.5V6"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default CallDirectionIcon;
