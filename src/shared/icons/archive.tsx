import Svg, { Path } from "react-native-svg";

interface ArchiveIconProps {
  size?: number;
  color?: string;
}

const ArchiveIcon = ({ size = 24, color = "#FFFFFF" }: ArchiveIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.80002 3.6001C3.47454 3.6001 2.40002 4.67461 2.40002 6.0001C2.40002 7.32558 3.47454 8.4001 4.80002 8.4001H19.2C20.5255 8.4001 21.6 7.32558 21.6 6.0001C21.6 4.67461 20.5255 3.6001 19.2 3.6001H4.80002Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.60002 9.6001H20.4V18.0001C20.4 19.3256 19.3255 20.4001 18 20.4001H6.00002C4.67454 20.4001 3.60002 19.3256 3.60002 18.0001V9.6001ZM9.60002 13.2001C9.60002 12.5374 10.1373 12.0001 10.8 12.0001H13.2C13.8628 12.0001 14.4 12.5374 14.4 13.2001C14.4 13.8628 13.8628 14.4001 13.2 14.4001H10.8C10.1373 14.4001 9.60002 13.8628 9.60002 13.2001Z"
        fill={color}
      />
    </Svg>
  );
};

export default ArchiveIcon;
