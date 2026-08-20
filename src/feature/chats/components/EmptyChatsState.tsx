import { getLineHeight } from "@/src/helpers/lineHeight";
import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { StyleSheet, View } from "react-native";
import { SuggestedContact } from "../types";
import { AvatarStack } from "./AvatarStack";

interface EmptyChatsStateProps {
  contacts: SuggestedContact[];
  overflowCount: number;
}

export const EmptyChatsState = ({
  contacts,
  overflowCount,
}: EmptyChatsStateProps) => {
  const { theme } = useTheme();
  const namedContacts = contacts.slice(0, 3);
  const names = namedContacts.map((contact) => contact.name).join(", ");

  return (
    <View style={styles.container}>
      <AvatarStack contacts={contacts} overflowCount={overflowCount} />
      <StyledText
        style={[styles.description, { color: theme.textSecondary }]}
        size={14}
      >
        <StyledText
          weight="medium"
          style={{ color: theme.textPrimary, lineHeight: getLineHeight(14) }}
          size={14}
        >
          {names}
        </StyledText>{" "}
        and {overflowCount}+ contact found on Chatme, try sending a message to
        them or just saying hello.
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    paddingTop: 203,
    paddingHorizontal: 24,
  },
  description: {
    textAlign: "center",
    lineHeight: getLineHeight(14),
  },
});
