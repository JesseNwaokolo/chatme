import { Avatar } from "@/src/shared/components/Avatar";
import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { Pressable, StyleSheet, View } from "react-native";
import { BlockedContact } from "../data/mockBlockedContacts";

interface BlockedContactRowProps {
  contact: BlockedContact;
  onPress?: () => void;
}

export const BlockedContactRow = ({ contact, onPress }: BlockedContactRowProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar name={contact.name} imageUrl={contact.avatarUrl} size={48} />
      <View style={styles.body}>
        <StyledText weight="bold" numberOfLines={1} ellipsizeMode="tail">
          {contact.name}
        </StyledText>
        <StyledText size={14} style={styles.phone}>
          {contact.phoneNumber}
        </StyledText>
      </View>
      <View style={styles.chevron}>
        <ChevronLeftIcon size={18} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    phone: {
      color: theme.textSecondary,
    },
    chevron: {
      transform: [{ rotate: "180deg" }],
    },
  });
