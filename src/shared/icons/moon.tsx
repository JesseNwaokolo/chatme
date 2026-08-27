import Svg, { Path } from "react-native-svg";

interface MoonIconProps {
  size?: number;
  color?: string;
}

const MoonIcon = ({ size = 16, color = "#57B77D" }: MoonIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M4.47119 3.271C4.35979 3.76316 4.30029 4.27503 4.30029 4.80029C4.30039 8.61084 7.38918 11.6995 11.1997 11.6997C11.7243 11.6997 12.2355 11.6399 12.7271 11.5288C11.6508 12.968 9.93465 13.8998 8.00049 13.8999C4.74201 13.8999 2.1001 11.258 2.1001 7.99951C2.10024 6.06496 3.03144 4.34715 4.47119 3.271Z"
        fill={color}
        stroke={color}
      />
    </Svg>
  );
};

export default MoonIcon;
