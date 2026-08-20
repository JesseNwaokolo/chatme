import Svg, { Path } from "react-native-svg";

interface PinIconProps {
  size?: number;
  color?: string;
}

const PinIcon = ({ size = 24, color = "#FFFFFF" }: PinIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 12.87C19 12.4 18.66 12.02 18.2 11.89C17.5675 11.7155 17.0098 11.3383 16.6123 10.8162C16.2149 10.2942 15.9998 9.65612 16 9V4H17C17.55 4 18 3.55 18 3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3C6 3.55 6.45 4 7 4H8V9C8 10.38 7.07 11.54 5.8 11.89C5.34 12.02 5 12.4 5 12.87V13C5 13.55 5.45 14 6 14H10.98L11 21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21L12.98 14H18C18.55 14 19 13.55 19 13V12.87Z"
        fill={color}
      />
    </Svg>
  );
};

export default PinIcon;
