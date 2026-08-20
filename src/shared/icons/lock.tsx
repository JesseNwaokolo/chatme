import Svg, { Path } from "react-native-svg";

interface LockIconProps {
  size?: number;
  color?: string;
}

const LockIcon = ({ size = 32, color = "#57B77D" }: LockIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00005 14.4V11.2C8.00005 6.78167 11.5818 3.19995 16 3.19995C20.4183 3.19995 24 6.78167 24 11.2V14.4C25.7674 14.4 27.2 15.8326 27.2 17.6V25.6C27.2 27.3673 25.7674 28.8 24 28.8H8.00005C6.23274 28.8 4.80005 27.3673 4.80005 25.6V17.6C4.80005 15.8326 6.23274 14.4 8.00005 14.4ZM20.8 11.2V14.4H11.2V11.2C11.2 8.54898 13.3491 6.39995 16 6.39995C18.651 6.39995 20.8 8.54898 20.8 11.2Z"
        fill={color}
      />
    </Svg>
  );
};

export default LockIcon;
