import { getLineHeight } from "@/src/helpers/lineHeight";
import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { StyleSheet, View } from "react-native";

export const EmptyChatsState = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <StyledText
        weight="bold"
        size={18}
        style={{ color: theme.textPrimary, textAlign: "center" }}
      >
        No chats yet
      </StyledText>
      <StyledText
        style={[styles.description, { color: theme.textSecondary }]}
        size={14}
      >
        Tap + to start a conversation.
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingTop: 203,
    paddingHorizontal: 24,
  },
  description: {
    textAlign: "center",
    lineHeight: getLineHeight(14),
  },
});
