import Svg, { Circle, Path } from "react-native-svg";

interface AppLogoIconProps {
  size?: number;
  color?: string;
}

const AppLogoIcon = ({ size = 48, color = "#007CFF" }: AppLogoIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M30 27.9995C30 27.9995 28.125 29.812 24 29.812C19.875 29.812 18 27.9995 18 27.9995"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M28 38C35.542 38 39.314 38 41.656 35.656C44 33.314 44 29.542 44 22C44 14.458 44 10.686 41.656 8.344C39.314 6 35.542 6 28 6H20C12.458 6 8.686 6 6.344 8.344C4 10.686 4 14.458 4 22C4 29.542 4 33.314 6.344 35.656C7.65 36.964 9.4 37.542 12 37.796"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 38.0005C25.528 38.0005 22.804 39.0005 20.318 40.2905C16.322 42.3645 14.324 43.4025 13.34 42.7405C12.356 42.0805 12.542 40.0305 12.916 35.9325L13 35.0005"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={14.625} cy={16.5} r={3.75} fill={color} />
      <Circle cx={33.375} cy={16.5} r={3.75} fill={color} />
    </Svg>
  );
};

export default AppLogoIcon;
