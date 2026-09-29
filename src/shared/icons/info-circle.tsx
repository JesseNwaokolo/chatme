import Svg, { Circle, Line } from "react-native-svg";

interface InfoCircleIconProps {
  size?: number;
  color?: string;
}

const InfoCircleIcon = ({ size = 20, color = "#57B77D" }: InfoCircleIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth={1.5} />
      <Line x1="8" y1="7.2" x2="8" y2="11" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="8" cy="5" r="0.9" fill={color} />
    </Svg>
  );
};

export default InfoCircleIcon;
