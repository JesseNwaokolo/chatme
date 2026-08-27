import Svg, { Path, Rect } from "react-native-svg";

interface PlusIconProps {
  size?: number;
  color?: string;
}

const PlusIcon = ({ size = 64, color }: PlusIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect width={64} height={64} rx={32} fill={color ?? "#57B77D"} />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 23.6001C32.6627 23.6001 33.2 24.1374 33.2 24.8001V30.8001H39.2C39.8627 30.8001 40.4 31.3374 40.4 32.0001C40.4 32.6628 39.8627 33.2001 39.2 33.2001H33.2V39.2001C33.2 39.8628 32.6627 40.4001 32 40.4001C31.3373 40.4001 30.8 39.8628 30.8 39.2001V33.2001H24.8C24.1373 33.2001 23.6 32.6628 23.6 32.0001C23.6 31.3374 24.1373 30.8001 24.8 30.8001L30.8 30.8001V24.8001C30.8 24.1374 31.3373 23.6001 32 23.6001Z"
        fill="white"
      />
    </Svg>
  );
};

export default PlusIcon;
