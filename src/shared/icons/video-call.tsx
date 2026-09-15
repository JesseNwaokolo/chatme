import Svg, { Path } from "react-native-svg";

interface VideoCallIconProps {
  size?: number;
  color?: string;
}

const VideoCallIcon = ({ size = 24, color = "#FFFFFF" }: VideoCallIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.40002 7.19981C2.40002 5.87432 3.47454 4.7998 4.80002 4.7998H12C13.3255 4.7998 14.4 5.87432 14.4 7.1998V16.7998C14.4 18.1253 13.3255 19.1998 12 19.1998H4.80002C3.47454 19.1998 2.40002 18.1253 2.40002 16.7998V7.19981Z"
        fill={color}
      />
      <Path
        d="M17.4634 8.52649C17.0568 8.72976 16.8 9.14528 16.8 9.59981V14.3998C16.8 14.8543 17.0568 15.2698 17.4634 15.4731L19.8634 16.6731C20.2354 16.8591 20.6771 16.8392 21.0309 16.6206C21.3847 16.4019 21.6 16.0157 21.6 15.5998V8.39981C21.6 7.98391 21.3847 7.59767 21.0309 7.37902C20.6771 7.16038 20.2354 7.1405 19.8634 7.32649L17.4634 8.52649Z"
        fill={color}
      />
    </Svg>
  );
};

export default VideoCallIcon;
