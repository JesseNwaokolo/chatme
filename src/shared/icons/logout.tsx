import Svg, { Path } from "react-native-svg";

interface LogoutIconProps {
  size?: number;
  color?: string;
}

const LogoutIcon = ({ size = 16, color = "#57B77D" }: LogoutIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.33333 5.33317L4.66667 7.99984L7.33333 10.6665M4.66667 7.99984L14 7.99984M10.6667 10.6665V11.3332C10.6667 12.4377 9.77124 13.3332 8.66667 13.3332H4C2.89543 13.3332 2 12.4377 2 11.3332V4.6665C2 3.56193 2.89543 2.6665 4 2.6665H8.66667C9.77124 2.6665 10.6667 3.56193 10.6667 4.6665V5.33317"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default LogoutIcon;
