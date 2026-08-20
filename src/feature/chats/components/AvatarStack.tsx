import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { StyleSheet, View } from "react-native";
import { SuggestedContact } from "../types";
import { Avatar } from "./Avatar";

interface AvatarStackProps {
  contacts: SuggestedContact[];
  overflowCount?: number;
  size?: number;
}

export const AvatarStack = ({
  contacts,
  overflowCount,
  size = 56,
}: AvatarStackProps) => {
  const { theme } = useTheme();
  const overlap = size * 0.3;

  return (
    <View style={styles.row}>
      {contacts.map((contact, index) => (
        <View
          key={contact.id}
          style={[
            styles.item,
            {
              marginLeft: index === 0 ? 0 : -overlap,
              borderColor: theme.bgNeutral,
              borderRadius: size / 2,
            },
          ]}
        >
          <Avatar name={contact.name} size={size} />
        </View>
      ))}
      {!!overflowCount && (
        <View
          style={[
            styles.item,
            styles.overflow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlap,
              borderColor: theme.bgNeutral,
              backgroundColor: theme.border,
            },
          ]}
        >
          <StyledText weight="bold" size={size * 0.28} style={{ color: theme.textSecondary }}>
            {overflowCount}+
          </StyledText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    borderWidth: 2,
  },
  overflow: {
    alignItems: "center",
    justifyContent: "center",
  },
});
