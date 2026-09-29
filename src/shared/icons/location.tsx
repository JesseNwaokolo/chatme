import Svg, { Path } from "react-native-svg";

interface LocationIconProps {
  size?: number;
  color?: string;
}

const LocationIcon = ({ size = 20, color = "#57B77D" }: LocationIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C6.68629 2 4 4.68629 4 8C4 12.5 10 18 10 18C10 18 16 12.5 16 8C16 4.68629 13.3137 2 10 2ZM10 10.5C8.61929 10.5 7.5 9.38071 7.5 8C7.5 6.61929 8.61929 5.5 10 5.5C11.3807 5.5 12.5 6.61929 12.5 8C12.5 9.38071 11.3807 10.5 10 10.5Z"
        fill={color}
      />
    </Svg>
  );
};

export default LocationIcon;
