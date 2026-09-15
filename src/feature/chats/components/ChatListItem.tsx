import { formatChatTime } from "@/src/helpers/formatChatTime";
import { StyledText } from "@/src/shared/components/StyledText";
import {
  ArchiveIcon,
  DeleteIcon,
  MoreIcon,
  MuteIcon,
  PinIcon,
} from "@/src/shared/icons";
import { useTheme } from "@/src/theme/useTheme";
import { Theme } from "@/src/theme/useThemeStore";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import Swipeable, {
  SwipeableMethods,
  SwipeDirection,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Chat } from "../types";
import { Avatar } from "@/src/shared/components/Avatar";
import { SwipeActionButton } from "./SwipeActionButton";

interface ChatListItemProps {
  chat: Chat;
  onPress?: () => void;
  onToggleMute?: () => void;
  onTogglePinned?: () => void;
  onDelete?: () => void;
  onToggleArchived?: () => void;
  onMore?: () => void;
}

export const ChatListItem = ({
  chat,
  onPress,
  onToggleMute,
  onTogglePinned,
  onDelete,
  onToggleArchived,
  onMore,
}: ChatListItemProps) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { label, isToday } = formatChatTime(chat.timestamp);
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [openDirection, setOpenDirection] = useState<SwipeDirection | null>(null);

  const renderLeftActions = () => (
    <View
      style={styles.actionsRow}
      // Swipeable reports the direction the row itself moved, not which
      // panel is showing — revealing the left actions moves the row right.
      pointerEvents={openDirection === SwipeDirection.RIGHT ? "auto" : "none"}
    >
      <SwipeActionButton
        label="Mute"
        icon={<MuteIcon color={theme.buttonPrimaryText} />}
        backgroundColor={theme.warning}
        onPress={() => {
          swipeableRef.current?.close();
          Alert.alert("Mute");
          onToggleMute?.();
        }}
      />
      <SwipeActionButton
        label="Pinned"
        icon={<PinIcon color={theme.buttonPrimaryText} />}
        backgroundColor={theme.neutralAction}
        onPress={() => {
          swipeableRef.current?.close();
          Alert.alert("Pinned");
          onTogglePinned?.();
        }}
      />
    </View>
  );

  const renderRightActions = () => (
    <View
      style={styles.actionsRow}
      // Same inversion as above — revealing the right actions moves the
      // row left.
      pointerEvents={openDirection === SwipeDirection.LEFT ? "auto" : "none"}
    >
      <SwipeActionButton
        label="Delete"
        icon={<DeleteIcon color={theme.buttonPrimaryText} />}
        backgroundColor={theme.danger}
        onPress={() => {
          Alert.alert("Delete");
          onDelete?.();
        }}
      />
      <SwipeActionButton
        label="Archived"
        icon={<ArchiveIcon color={theme.buttonPrimaryText} />}
        backgroundColor={theme.neutralAction}
        onPress={() => {
          swipeableRef.current?.close();
          Alert.alert("Archived");
          onToggleArchived?.();
        }}
      />
      <SwipeActionButton
        label="More"
        icon={<MoreIcon color={theme.buttonPrimaryText} />}
        backgroundColor={theme.neutralActionLight}
        onPress={() => {
          swipeableRef.current?.close();
          onMore?.();
        }}
      />
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableWillOpen={setOpenDirection}
      onSwipeableWillClose={() => setOpenDirection(null)}
    >
      <Pressable style={styles.row} onPress={onPress}>
        <Avatar
          name={chat.name}
          imageUrl={chat.avatarUrl}
          isGroup={chat.isGroup}
          online={chat.online}
        />
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <StyledText weight="bold" numberOfLines={1} style={styles.name}>
              {chat.name}
            </StyledText>
            {chat.pinned && <PinIcon color={theme.textSecondary} />}
            {chat.muted && <MuteIcon color={theme.textSecondary} />}
          </View>
          <StyledText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.message}
          >
            {chat.fromMe ? (
              <StyledText style={{ color: theme.textPrimary }}>You: </StyledText>
            ) : null}
            <StyledText style={{ color: theme.textSecondary }}>{chat.lastMessage}</StyledText>
          </StyledText>
        </View>
        <View style={styles.meta}>
          <StyledText
            size={14}
            style={{ color: isToday ? theme.buttonPrimary : theme.textSecondary }}
          >
            {label}
          </StyledText>
          {!!chat.unreadCount && (
            <View style={styles.badge}>
              <StyledText size={14} weight="bold" style={styles.badgeText}>
                {chat.unreadCount}
              </StyledText>
            </View>
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      padding: 12,
      backgroundColor: theme.bgNeutral,
    },
    actionsRow: {
      flexDirection: "row",
      gap : 8,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    name: {
      color: theme.textPrimary,
    },
    message: {
      color: theme.textSecondary,
    },
    meta: {
      alignItems: "flex-end",
      gap: 6,
    },
    badge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
    },
    badgeText: {
      color: theme.buttonPrimaryText,
    },
  });
};
