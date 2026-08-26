import Svg, { Path } from "react-native-svg";

interface BellIconProps {
  size?: number;
  color?: string;
}

const BellIcon = ({ size = 16, color = "#57B77D" }: BellIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M10 11.3333H13.3333L12.3967 10.3967C12.1427 10.1427 12 9.79819 12 9.43897V7.33334C12 5.59171 10.8869 4.11006 9.33333 3.56094V3.33333C9.33333 2.59695 8.73638 2 8 2C7.26362 2 6.66667 2.59695 6.66667 3.33333V3.56094C5.11308 4.11006 4 5.59171 4 7.33334V9.43897C4 9.79819 3.8573 10.1427 3.60329 10.3967L2.66667 11.3333H6M10 11.3333V12C10 13.1046 9.10457 14 8 14C6.89543 14 6 13.1046 6 12V11.3333M10 11.3333H6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BellIcon;
