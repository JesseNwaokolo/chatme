import { Dimensions, PixelRatio } from "react-native";

const DESIGN_SCREEN_WIDTH = 375;

export function getScaledFontSize(fontSize: number): number {
  const { width } = Dimensions.get("window");
  const scale = width / DESIGN_SCREEN_WIDTH;
  return PixelRatio.roundToNearestPixel(fontSize * scale);
}
