import { StyledText } from "@/src/shared/components/StyledText";
import { useTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { ToastConfig, ToastConfigParams } from "react-native-toast-message";

type ToastCardProps = ToastConfigParams<unknown> & {
  variant: "success" | "error";
};

const ToastCard = ({ text1, text2, variant }: ToastCardProps) => {
  const { theme } = useTheme();
  const isSuccess = variant === "success";
  const accent = isSuccess ? theme.buttonPrimary : theme.danger;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgNeutral, shadowColor: theme.shadow },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${accent}1A` }]}>
        <Ionicons
          name={isSuccess ? "checkmark" : "close"}
          size={18}
          color={accent}
        />
      </View>
      <View style={styles.textContainer}>
        {text1 ? (
          <StyledText weight="bold" size={14}>
            {text1}
          </StyledText>
        ) : null}
        {text2 ? (
          <StyledText size={13} style={{ color: theme.textSecondary }}>
            {text2}
          </StyledText>
        ) : null}
      </View>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (params) => <ToastCard {...params} variant="success" />,
  error: (params) => <ToastCard {...params} variant="error" />,
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
