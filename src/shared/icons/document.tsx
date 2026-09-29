import Svg, { Path } from "react-native-svg";

interface DocumentIconProps {
  size?: number;
  color?: string;
}

const DocumentIcon = ({ size = 20, color = "#57B77D" }: DocumentIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 2C3.89543 2 3 2.89543 3 4V16C3 17.1046 3.89543 18 5 18H15C16.1046 18 17 17.1046 17 16V8L11 2H5ZM10 3.5V7C10 7.55228 10.4477 8 11 8H14.5L10 3.5ZM6 11C6 10.4477 6.44772 10 7 10H13C13.5523 10 14 10.4477 14 11C14 11.5523 13.5523 12 13 12H7C6.44772 12 6 11.5523 6 11ZM7 13.5C6.44772 13.5 6 13.9477 6 14.5C6 15.0523 6.44772 15.5 7 15.5H10.5C11.0523 15.5 11.5 15.0523 11.5 14.5C11.5 13.9477 11.0523 13.5 10.5 13.5H7Z"
        fill={color}
      />
    </Svg>
  );
};

export default DocumentIcon;
