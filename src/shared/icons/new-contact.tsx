import Svg, { Path } from "react-native-svg";

interface NewContactIconProps {
  size?: number;
  color?: string;
}

const NewContactIcon = ({ size = 24, color = "#57B77D" }: NewContactIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.6 11.9999C21.6 17.3018 17.3019 21.5999 12 21.5999C6.69806 21.5999 2.39999 17.3018 2.39999 11.9999C2.39999 6.69797 6.69806 2.3999 12 2.3999C17.3019 2.3999 21.6 6.69797 21.6 11.9999ZM14.4 8.3999C14.4 9.72539 13.3255 10.7999 12 10.7999C10.6745 10.7999 9.59999 9.72539 9.59999 8.3999C9.59999 7.07442 10.6745 5.9999 12 5.9999C13.3255 5.9999 14.4 7.07442 14.4 8.3999ZM11.9999 13.1999C9.57886 13.1999 7.49273 14.6338 6.54448 16.6988C7.86483 18.2303 9.81917 19.1999 12 19.1999C14.1807 19.1999 16.135 18.2304 17.4554 16.6989C16.5072 14.6339 14.421 13.1999 11.9999 13.1999Z"
        fill={color}
      />
    </Svg>
  );
};

export default NewContactIcon;
