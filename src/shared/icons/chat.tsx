import Svg, { Path } from "react-native-svg";

interface ChatIconProps {
  size?: number;
  color?: string;
}

const ChatIcon = ({ size = 28, color = "#6E8597" }: ChatIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.2 14.0002C25.2 19.4126 20.1856 23.8002 14 23.8002C11.9117 23.8002 9.95691 23.3001 8.28348 22.4293L2.8 23.8002L4.67363 19.4284C3.48992 17.8744 2.8 16.0078 2.8 14.0002C2.8 8.5878 7.81441 4.2002 14 4.2002C20.1856 4.2002 25.2 8.5878 25.2 14.0002ZM9.8 12.6002H7V15.4002H9.8V12.6002ZM21 12.6002H18.2V15.4002H21V12.6002ZM12.6 12.6002H15.4V15.4002H12.6V12.6002Z"
        fill={color}
      />
    </Svg>
  );
};

export default ChatIcon;
