import { forwardRef } from "react";
import type { ScrollViewProps } from "react-native";
import type Reanimated from "react-native-reanimated";
import {
  KeyboardChatScrollView,
  type KeyboardChatScrollViewProps,
} from "react-native-keyboard-controller";

const VirtualizedListScrollView = forwardRef<
  Reanimated.ScrollView,
  ScrollViewProps & KeyboardChatScrollViewProps
>((props, ref) => {
  return (
    <KeyboardChatScrollView
      ref={ref}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode="interactive"
      {...props}
    />
  );
});

VirtualizedListScrollView.displayName = "VirtualizedListScrollView";

export default VirtualizedListScrollView;
