import Svg, { Circle, Path } from "react-native-svg";

interface PlusCircleOutlineIconProps {
  size?: number;
  color?: string;
}

const PlusCircleOutlineIcon = ({ size = 32, color = "#57B77D" }: PlusCircleOutlineIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx={16} cy={16} r={15} stroke={color} strokeWidth={1.5} />
    <Path d="M16 11V21M11 16H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

export default PlusCircleOutlineIcon;
