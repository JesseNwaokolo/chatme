import Svg, { Path } from "react-native-svg";

interface ContrastIconProps {
  size?: number;
  color?: string;
}

const ContrastIcon = ({ size = 16, color = "#57B77D" }: ContrastIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 14.6668C11.682 14.6668 14.6667 11.6822 14.6667 8.00016C14.6667 4.31816 11.682 1.3335 8 1.3335C4.318 1.3335 1.33333 4.31816 1.33333 8.00016C1.33333 11.6822 4.318 14.6668 8 14.6668ZM8 13.3335V2.66683C9.41449 2.66683 10.771 3.22873 11.7712 4.22893C12.7714 5.22912 13.3333 6.58567 13.3333 8.00016C13.3333 9.41465 12.7714 10.7712 11.7712 11.7714C10.771 12.7716 9.41449 13.3335 8 13.3335Z"
        fill={color}
      />
    </Svg>
  );
};

export default ContrastIcon;
