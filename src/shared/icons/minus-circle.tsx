import Svg, { Path, Rect } from "react-native-svg";

interface MinusCircleIconProps {
  size?: number;
  color?: string;
}

const MinusCircleIcon = ({ size = 64, color }: MinusCircleIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect width={64} height={64} rx={32} fill={color ?? "#57B77D"} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23.6 32.0001C23.6 31.3374 24.1373 30.8001 24.8 30.8001H39.2C39.8627 30.8001 40.4 31.3374 40.4 32.0001C40.4 32.6628 39.8627 33.2001 39.2 33.2001H24.8C24.1373 33.2001 23.6 32.6628 23.6 32.0001Z"
      fill="white"
    />
  </Svg>
);

export default MinusCircleIcon;
