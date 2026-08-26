import Svg, { Path } from "react-native-svg";

interface LockOutlineIconProps {
  size?: number;
  color?: string;
}

const LockOutlineIcon = ({
  size = 16,
  color = "#57B77D",
}: LockOutlineIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 10V11.3333M4 14H12C12.7364 14 13.3333 13.403 13.3333 12.6667V8.66667C13.3333 7.93029 12.7364 7.33333 12 7.33333H4C3.26362 7.33333 2.66667 7.93029 2.66667 8.66667V12.6667C2.66667 13.403 3.26362 14 4 14ZM10.6667 7.33333V4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667V7.33333H10.6667Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default LockOutlineIcon;
