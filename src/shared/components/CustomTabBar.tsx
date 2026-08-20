import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? theme.buttonPrimary : theme.textSecondary;
        const label = options.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={styles.item}
          >
            {options.tabBarIcon?.({ focused, color, size: 24 })}
            <StyledText size={12} style={{ color }}>
              {label}
            </StyledText>
          </Pressable>
        );
      })}
    </View>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.bgNeutral,
      paddingTop: 8,
      elevation: 5,
      shadowColor: theme.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -6 },
    },
    item: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
  });
};
