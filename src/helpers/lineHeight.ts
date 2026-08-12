import { getScaledFontSize } from "./fontScale";

export function getLineHeight(fontSize: number, multiplier: number = 1.5): number {
  return Math.round(getScaledFontSize(fontSize) * multiplier);
}
