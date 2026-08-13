import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

interface MySafeAreaProps extends SafeAreaViewProps {
  disableBottomEdge?: boolean;
}

export const MySafeArea = ({
  style,
  edges,
  disableBottomEdge = false,
  ...rest
}: MySafeAreaProps) => {
  const resolvedEdges =
    edges ??
    (disableBottomEdge
      ? ["top", "left", "right"]
      : ["top", "left", "right", "bottom"]);

  return (
    <SafeAreaView
      edges={resolvedEdges}
      style={[styles.container, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
