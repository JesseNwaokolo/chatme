import Svg, { Circle, Path } from "react-native-svg";

interface BlockIconProps {
  size?: number;
  color?: string;
}

const BlockIcon = ({ size = 20, color = "#DD524C" }: BlockIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M5.636 5.636l12.728 12.728"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default BlockIcon;
