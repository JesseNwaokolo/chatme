import { StyledText } from "@/src/shared/components/StyledText";
import { AppLogoIcon } from "@/src/shared/icons";
import { Pressable, StyleSheet, View } from "react-native";

interface AppIconSwatchProps {
  name: string;
  color: string;
  lightColor: string;
  selected: boolean;
  onPress: () => void;
}

const TILE_SIZE = 72;

export const AppIconSwatch = ({
  name,
  color,
  lightColor,
  selected,
  onPress,
}: AppIconSwatchProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.tile,
          { backgroundColor: lightColor },
          { borderColor: selected ? color : "transparent" },
        ]}
      >
        <AppLogoIcon size={40} color={color} />
      </View>
      <StyledText weight="medium" size={13} style={{ color }}>
        {name}
      </StyledText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
