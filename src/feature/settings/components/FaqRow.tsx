import { StyledText } from "@/src/shared/components/StyledText";
import { MinusCircleIcon, PlusCircleOutlineIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";
import { FaqItem } from "../data/mockFaqItems";

interface FaqRowProps {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
}

export const FaqRow = ({ item, expanded, onToggle }: FaqRowProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <View style={styles.questionRow}>
        <StyledText weight="bold" size={17} style={styles.question}>
          {item.question}
        </StyledText>
        {expanded ? <MinusCircleIcon size={28} /> : <PlusCircleOutlineIcon size={28} />}
      </View>
      {expanded && (
        <StyledText size={15} style={styles.answer}>
          {item.answer}
        </StyledText>
      )}
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 8,
    },
    questionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    question: {
      flex: 1,
      color: theme.textPrimary,
    },
    answer: {
      color: theme.textSecondary,
      lineHeight: 22,
    },
  });
