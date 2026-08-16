import Svg, { Path } from "react-native-svg";

interface GalleryIconProps {
  size?: number;
  color?: string;
}

const GalleryIcon = ({ size = 20, color = "#57B77D" }: GalleryIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 3C2.89543 3 2 3.89543 2 5V15C2 16.1046 2.89543 17 4 17H16C17.1046 17 18 16.1046 18 15V5C18 3.89543 17.1046 3 16 3H4ZM16 15H4L8 7L11 13L13 9L16 15Z"
        fill={color}
      />
    </Svg>
  );
};

export default GalleryIcon;
