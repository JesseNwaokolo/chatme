import { StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

export const MySafeArea = ({ style, ...rest }: SafeAreaViewProps) => {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
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
