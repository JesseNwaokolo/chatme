import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";

interface ThemeSwatchProps {
  name: string;
  color: string;
  lightColor: string;
  selected: boolean;
  onPress: () => void;
}

export const ThemeSwatch = ({
  name,
  color,
  lightColor,
  selected,
  onPress,
}: ThemeSwatchProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: lightColor },
        { borderColor: selected ? color : theme.border },
      ]}
    >
      <View style={styles.preview}>
        <View style={[styles.bar, styles.barWide, { backgroundColor: color }]} />
        <View style={[styles.bar, styles.barNarrow, { backgroundColor: theme.bgNeutral }]} />
      </View>

      {selected ? (
        <View style={[styles.labelBand, { backgroundColor: color }]}>
          <StyledText weight="bold" size={13} style={{ color: theme.buttonPrimaryText }}>
            {name}
          </StyledText>
        </View>
      ) : (
        <View style={styles.labelPlain}>
          <StyledText weight="medium" size={13} style={{ color }}>
            {name}
          </StyledText>
        </View>
      )}

      {selected && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <StyledText size={10} weight="bold" style={{ color: theme.buttonPrimaryText }}>
            ✓
          </StyledText>
        </View>
      )}
    </Pressable>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 2,
      overflow: "hidden",
    },
    preview: {
      padding: 12,
      gap: 6,
    },
    bar: {
      height: 10,
      borderRadius: 6,
    },
    barWide: {
      width: "80%",
    },
    barNarrow: {
      width: "55%",
    },
    labelBand: {
      paddingVertical: 8,
      alignItems: "center",
    },
    labelPlain: {
      paddingVertical: 8,
      paddingBottom: 12,
      alignItems: "center",
    },
    badge: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.bgNeutral,
    },
  });
};
