import Svg, { Path } from "react-native-svg";

interface ChevronLeftProps {
  size?: number;
  color?: string;
}

const ChevronLeft = ({ size = 24, color = "#081C2C" }: ChevronLeftProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19L8 12L15 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronLeft;
