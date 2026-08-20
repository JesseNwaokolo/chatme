import Svg, { Path } from "react-native-svg";

interface CallIconProps {
  size?: number;
  color?: string;
}

const CallIcon = ({ size = 28, color = "#6E8597" }: CallIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M2.79999 4.20005C2.79999 3.42685 3.42679 2.80005 4.19999 2.80005H7.21401C7.89838 2.80005 8.48245 3.29483 8.59496 3.96989L9.63 10.1801C9.73104 10.7864 9.42487 11.3876 8.87515 11.6625L6.70775 12.7462C8.27057 16.6297 11.3703 19.7295 15.2539 21.2923L16.3376 19.1249C16.6124 18.5752 17.2137 18.269 17.8199 18.37L24.0301 19.4051C24.7052 19.5176 25.2 20.1017 25.2 20.786V23.8C25.2 24.5732 24.5732 25.2 23.8 25.2H21C10.9484 25.2 2.79999 17.0516 2.79999 7.00005V4.20005Z"
        fill={color}
      />
    </Svg>
  );
};

export default CallIcon;
